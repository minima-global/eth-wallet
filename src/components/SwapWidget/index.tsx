import { Formik } from "formik";
import FieldWrapper from "./FieldWrapper";
import SwapDirection from "./SwapDirection";
import { useTokenStoreContext } from "../../providers/TokenStoreProvider";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";
import { _defaults } from "../../constants";
import { Asset } from "../../types/Asset";
import { QuoteContextProvider } from "../../providers/QuoteProvider/QuoteProvider";

import {
  SUPPORTED_CHAINS,
  Token,

} from "@uniswap/sdk-core";

import { useContext, useState } from "react";
import { appContext } from "../../AppContext";
import AllowanceApproval from "../AllowanceApproval";
import Decimal from "decimal.js";
import GasFeeEstimator from "./GasFeeEstimator";
import { NonceManager } from "ethers";

const SwapWidget = () => {
  const { _network, _wallet } = useWalletContext();
  const { promptAllowanceApprovalModal } = useContext(appContext);
  const { tokens } = useTokenStoreContext();
  

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
          tx: null,
          gas: null,
          tokenA: new Token(
            SUPPORTED_CHAINS["1"],
            "0x669c01CAF0eDcaD7c2b8Dc771474aD937A7CA4AF",
            18,
            "WMINIMA",
            "Wrapped Minima"
          ),
          tokenB: new Token(
            SUPPORTED_CHAINS["1"],
            "0xdac17f958d2ee523a2206206994597c13d831ec7",
            6,
            "USDT",
            "Tether"
          )
        }}
        onSubmit={async ({ input, output, tx }) => {
          if (!input || !output || !tx) return;

      
          try {
            const nonceManager = new NonceManager(_wallet!);

          

          
            const res = await nonceManager.sendTransaction(tx);

            console.log(await res.wait());
            console.log("SWAP COMPLETED!");
          } catch (error) {
            console.error(error);
            // console.error(error && error.reason ? error.reason : error);
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

                  <GasFeeEstimator />
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
