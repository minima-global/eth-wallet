import { Formik } from "formik";
import FieldWrapper from "./FieldWrapper";
import SwapDirection from "./SwapDirection";
import { useTokenStoreContext } from "../../providers/TokenStoreProvider";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";
import { _defaults } from "../../constants";
import { Asset } from "../../types/Asset";
import { QuoteContextProvider } from "../../providers/QuoteProvider/QuoteProvider";
import {
  FeeAmount,
  Pool,
  Route,
  SwapOptions,
  SwapRouter,
  Trade,
} from "@uniswap/v3-sdk";
import {
  CurrencyAmount,
  Percent,
  SUPPORTED_CHAINS,
  Token,
  TradeType,
} from "@uniswap/sdk-core";
import { fromReadableAmount } from "../../utils/swap";

import JSBI from "jsbi";
import { useContext, useState } from "react";
import { appContext } from "../../AppContext";
import {
  MAX_FEE_PER_GAS,
  MAX_PRIORITY_FEE_PER_GAS,
  SWAP_ROUTER_ADDRESS,
} from "../../providers/QuoteProvider/libs/constants";
import usePoolInfo from "../../hooks/usePoolInfo";
import getOutputQuote from "./libs/getOutputQuote";
import { NonceManager } from "ethers";
import AllowanceApproval from "../AllowanceApproval";
import Decimal from "decimal.js";

const SwapWidget = () => {
  const { _network, _wallet, _address } = useWalletContext();
  const { _provider, promptAllowanceApprovalModal } = useContext(appContext);
  const { tokens } = useTokenStoreContext();
  const poolInfo = usePoolInfo();

  const [mustApprove, setApproval] = useState<boolean | null>(null);

  if (_network !== "mainnet") {
    return <p>This feature is only available on mainnet.</p>;
  }

  return (
    <div>
      <Formik
        initialValues={{
          inputAmount: 0,
          outputAmount: 0,
          input: tokens.find((t) => t.address === _defaults["wMinima"].mainnet),
          output: tokens.find((t) => t.address === _defaults["Tether"].mainnet),
        }}
        onSubmit={async ({ input, output, inputAmount }) => {
          if (!input || !output) return;

          const _tokenA = new Token(
            SUPPORTED_CHAINS["1"],
            input.address,
            input.decimals,
            input.symbol,
            input.name
          );

          const _tokenB = new Token(
            SUPPORTED_CHAINS["1"],
            output.address,
            output.decimals,
            output.symbol,
            output.name
          );

          const pool = new Pool(
            _tokenA,
            _tokenB,
            FeeAmount.HIGH,
            poolInfo.sqrtPriceX96.toString(),
            poolInfo.liquidity.toString(),
            parseInt(poolInfo.tick)
          );

          const swapRoute = new Route([pool], _tokenA, _tokenB);

          try {
            const nonceManager = new NonceManager(_wallet!);

            const quoteData = await getOutputQuote(
              _tokenA,
              inputAmount,
              swapRoute,
              _provider
            );

            // Create an unchecked Trade..
            const uncheckedTrade = Trade.createUncheckedTrade({
              route: swapRoute,
              inputAmount: CurrencyAmount.fromRawAmount(
                _tokenA,
                fromReadableAmount(
                  inputAmount.toString(),
                  _tokenA.decimals
                ).toString()
              ),
              outputAmount: CurrencyAmount.fromRawAmount(
                _tokenB,
                JSBI.BigInt(quoteData)
              ),
              tradeType: TradeType.EXACT_INPUT,
            });

            // console.log("Approve token to be spent", _tokenA);
            // const tokenApproval = await getTokenTransferApproval(
            //   _tokenA,
            //   inputAmount,
            //   nonceManager, // signer
            //   _provider,
            //   _address!
            // );
            // console.log("TOKEN APPROVAL STATUS", tokenApproval);

            const options: SwapOptions = {
              slippageTolerance: new Percent(50, 10_000), // 50 bips, or 0.50%
              deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes from the current Unix time
              recipient: _address!,
            };
            const methodParameters = SwapRouter.swapCallParameters(
              [uncheckedTrade],
              options
            );

            const tx = {
              data: methodParameters.calldata,
              to: SWAP_ROUTER_ADDRESS,
              value: methodParameters.value,
              from: _address,
              maxFeePerGas: MAX_FEE_PER_GAS,
              maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
            };
            console.log("EXECUTING SWAP!");
            const res = await nonceManager.sendTransaction(tx);
            console.log(await res.wait());
            console.log("SWAP COMPLETED!");
          } catch (error: any) {
            console.error(error);
            console.error(error && error.reason ? error.reason : error);
          }
        }}

      >
        {({ handleSubmit, values }) => (
          <QuoteContextProvider>
            <AllowanceApproval
              setApproval={setApproval}
              token={getTokenWrapper(values.input!)}
            />

            <form onSubmit={handleSubmit} className="relative">
              <FieldWrapper
                type="input"
                balance={values.input?.balance}
                decimals={values.input?.decimals}
                token={
                  <>{values.input ? getTokenWrapper(values.input) : null}</>
                }
              />
              <SwapDirection />
              <FieldWrapper
                extraClass="mt-1"
                type="output"
                balance={values.output?.balance}
                decimals={values.output?.decimals}
                token={
                  <>{values.output ? getTokenWrapper(values.output) : null}</>
                }
              />
              {!!values.inputAmount && !new Decimal(values.inputAmount).isZero() && (
                <>
                  {!mustApprove && (
                    <button
                      type="submit"
                      className="py-4 disabled:bg-gray-800 disabled:text-gray-600 hover:bg-opacity-90 bg-teal-300 text-black text-lg w-full font-bold my-2"
                    >
                      Swap
                    </button>
                  )}
                  {mustApprove && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        promptAllowanceApprovalModal();
                      }}
                      className="py-4 disabled:bg-gray-800 disabled:text-gray-600 hover:bg-opacity-90 bg-purple-300 text-black text-lg w-full font-bold my-2"
                    >
                      Approve {values.input!.symbol}
                    </button>
                  )}
                </>
              )}
            </form>
          </QuoteContextProvider>
        )}
      </Formik>
    </div>
  );
};

export default SwapWidget;

const getTokenWrapper = (asset: Asset) => {
  if (!asset) return null;

  const { address } = asset;

  const isWMINIMA = address === _defaults["wMinima"].mainnet;
  const isUSDT = address === _defaults["Tether"].mainnet;

  let tokenIconSrc = "";
  let tokenName = "";

  if (isWMINIMA) {
    tokenIconSrc = "./assets/token.svg";
    tokenName = "WMINIMA";
  } else if (isUSDT) {
    tokenIconSrc = "./assets/tether.svg";
    tokenName = "USDT";
  }

  return (
    <div className="text-center flex items-center gap-1 p-1 rounded">
      {tokenIconSrc && (
        <img
          alt="token-icon"
          src={tokenIconSrc}
          className="w-[24px] h-[24px] rounded-full"
        />
      )}

      {tokenName && <p className="font-bold">{tokenName}</p>}
    </div>
  );
};
