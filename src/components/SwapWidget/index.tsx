import { Formik } from "formik";
import FieldWrapper from "./FieldWrapper";
import SwapDirection from "./SwapDirection";
import { useTokenStoreContext } from "../../providers/TokenStoreProvider";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";
import { QUOTER_CONTRACT_ADDRESS, _defaults } from "../../constants";
import { Asset } from "../../types/Asset";
import { QuoteContextProvider } from "../../providers/QuoteProvider/QuoteProvider";
import usePoolInfo from "../../hooks/usePoolInfo";
import { FeeAmount, Pool, Route, SwapQuoter } from "@uniswap/v3-sdk";
import { CurrencyAmount, SUPPORTED_CHAINS, Token, TradeType } from "@uniswap/sdk-core";
import { formatUnits } from "ethers";
import { ethers } from "ethers-5";
import { useEffect } from "react";

function fromReadableAmount(
  amount: number,
  decimals: number
) {
  return ethers.utils.parseUnits(amount.toString(), decimals)
}

function toReadableAmount(rawAmount: number, decimals: number): string {
  return formatUnits(rawAmount, decimals).slice(0, 20);
}
const SwapWidget = () => {
  const { _network, _wallet } = useWalletContext();
  const { tokens } = useTokenStoreContext();
  const poolInfo = usePoolInfo();

  // fund me
  useEffect(() => {
    

  }, []);


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
        onSubmit={async ({ input, output, inputAmount, outputAmount }) => {
          // setLoading(true);
          console.log("inputAmount", inputAmount);
          console.log("outputAmount", outputAmount);
          if (!input || !output) return;
          // a modal instance of our pool
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

          try {
            console.log("POOLINFO", poolInfo);

            console.log("Current tick for the liquditiy", poolInfo.tick);

            // Create a new Pool Instance..
            const pool = new Pool(
              _tokenA,
              _tokenB,
              FeeAmount.HIGH,
              poolInfo.sqrtPriceX96.toString(),
              poolInfo.liquidity.toString(),
              parseInt(poolInfo.tick)
            );

            console.log("POOL INSTANCE", pool);


            const swapRoute = new Route([pool], _tokenA, _tokenB);

            console.log("Route for SWAP", swapRoute);

            
            const { calldata } = await SwapQuoter.quoteCallParameters(
              swapRoute,
              CurrencyAmount.fromRawAmount(
                _tokenA,
                fromReadableAmount(
                  inputAmount,
                  _tokenA.decimals
                ).toString()
              ),
              TradeType.EXACT_INPUT,
              {
                useQuoterV2: true,
              }
            )

            console.log("Call data", calldata);


            const quoteCallReturnData = await _wallet!.call({
              to: QUOTER_CONTRACT_ADDRESS,
              data: calldata,
            })
            
            
            console.log(ethers.utils.defaultAbiCoder.decode(['uint256'], quoteCallReturnData))
          } catch (error: any) {
            console.error(error && error.reason ? error.reason : error);
          }

          // const swapRoute = new Route(
          //   [pool],
          //   _tokenA,
          //   _tokenB
          // )

          // const { calldata } = await SwapQuoter.quoteCallParameters(
          //   swapRoute,
          //   CurrencyAmount.fromRawAmount(
          //     _tokenA,
          //     fromReadableAmount(
          //       inputAmount,
          //       _tokenA.decimals
          //     ).toString()
          //   ),
          //   TradeType.EXACT_INPUT,
          //   {
          //     useQuoterV2: true,
          //   }
          // )

          // console.log(calldata);
        }}
      >
        {({
          handleSubmit,
          // setFieldValue,
          // isSubmitting,
          // handleChange,
          // handleBlur,
          // touched,
          // errors,
          values,
          // isValid,
          // dirty,
          // resetForm
        }) => (
          <QuoteContextProvider>
            <form onSubmit={handleSubmit} className="relative">
              <FieldWrapper
                type="input"
                balance={values.input?.balance}
                token={
                  <>{values.input ? getTokenWrapper(values.input) : null}</>
                }
              />
              <SwapDirection />
              <FieldWrapper
                extraClass="mt-1"
                type="output"
                balance={values.output?.balance}
                token={
                  <>{values.output ? getTokenWrapper(values.output) : null}</>
                }
              />
              <button
                type="submit"
                className="py-4 disabled:bg-gray-800 disabled:text-gray-600 hover:bg-opacity-90 bg-teal-300 text-black text-lg w-full font-bold my-2"
              >
                Swap
              </button>
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
