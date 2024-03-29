import { Formik } from "formik";
import FieldWrapper from "./FieldWrapper";
import SwapDirection from "./SwapDirection";
import { useTokenStoreContext } from "../../providers/TokenStoreProvider";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";
import { _defaults } from "../../constants";
import { QuoteContextProvider } from "../../providers/QuoteProvider/QuoteProvider";
import * as yup from "yup";
import { SUPPORTED_CHAINS, Token } from "@uniswap/sdk-core";

import { useContext, useState } from "react";
import { appContext } from "../../AppContext";
import AllowanceApproval from "./AllowanceApproval";
import Decimal from "decimal.js";
import { MaxUint256, NonceManager } from "ethers";
import GasFeeEstimator from "./GasFeeEstimator";
import { createDecimal } from "../../utils";
import ReviewSwap from "./ReviewSwap";
import getTokenWrapper from "./libs/getTokenWrapper";

const SwapWidget = () => {
  const { _network } = useWalletContext();
  const { promptAllowanceApprovalModal, setTriggerBalanceUpdate } =
    useContext(appContext);
  const { _wallet } = useWalletContext();
  const { tokens } = useTokenStoreContext();

  const [step, setStep] = useState(1);
  const [error, setError] = useState<false | string>(false);

  if (_network !== "mainnet") {
    return <p>This feature is only available on mainnet.</p>;
  }

  return (
    <div>
      <Formik
        validationSchema={yup.object().shape({
          inputAmount: yup
            .string()
            .required("Enter an amount")
            .matches(/^\d+(\.\d+)?$/, "Invalid amount")
            .test("check for insufficient funds", function (val) {
              const { path, parent, createError } = this;

              if (!val || val.length === 0) return false;

              if (new Decimal(parent.input.balance).isZero()) {
                return createError({
                  path,
                  message: "Insufficient funds",
                });
              }

              try {
                const decimalVal = createDecimal(val);
                if (decimalVal === null) {
                  throw new Error("Invalid amount");
                }

                const spendAmount = decimalVal.times(
                  10 ** parent.input.decimals
                );

                if (spendAmount.gt(MaxUint256.toString())) {
                  throw new Error("You exceeded the max amount");
                }

                if (spendAmount.greaterThan(parent.input.balance)) {
                  throw new Error("Insufficient funds");
                }

                return true;
              } catch (error: any) {
                if (error instanceof Error) {
                  return createError({
                    path,
                    message: error.message,
                  });
                }

                return false;
              }
            }),
        })}
        initialValues={{
          inputAmount: "0",
          outputAmount: "0",
          input: tokens.find((t) => t.address === _defaults["wMinima"].mainnet),
          output: tokens.find((t) => t.address === _defaults["Tether"].mainnet),
          tx: null,
          receipt: null,
          gas: null,
          locked: null,
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
          ),
        }}
        onSubmit={async ({ input, output, tx }, { setFieldValue }) => {
          if (!input || !output || !tx) return;

          setStep(3);

          try {
            const nonceManager = new NonceManager(_wallet!);

            const res = await nonceManager.sendTransaction(tx);

            setFieldValue("receipt", await res.wait());

            setStep(4);
            setTimeout(() => {
              setTriggerBalanceUpdate((prevState) => !prevState);
            }, 4000);
          } catch (error) {
            console.error(error);
            setStep(5);
            if (error instanceof Error) {
              return setError(error.message);
            }

            return setError(JSON.stringify(error));
          }
        }}
      >
        {({ handleSubmit, values, isValid, errors, submitForm }) => (
          <QuoteContextProvider>
            <AllowanceApproval token={getTokenWrapper(values.input!)} />

            <form onSubmit={handleSubmit} className="relative">
              <>
                <FieldWrapper
                  disabled={
                    values.locked || new Decimal(values.input!.balance).isZero()
                      ? true
                      : false
                  }
                  type="input"
                  balance={values.input?.balance}
                  decimals={values.input?.decimals}
                  token={
                    <>{values.input ? getTokenWrapper(values.input) : null}</>
                  }
                />
                <SwapDirection />
                <FieldWrapper
                  disabled={
                    values.locked || new Decimal(values.input!.balance).isZero()
                      ? true
                      : false
                  }
                  extraClass="mt-1"
                  type="output"
                  balance={values.output?.balance}
                  decimals={values.output?.decimals}
                  token={
                    <>{values.output ? getTokenWrapper(values.output) : null}</>
                  }
                />
                {values.locked !== null && values.locked && (
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
                {(!values.locked || values.locked === null) && !isValid && (
                  <button
                    disabled={!isValid}
                    type="submit"
                    className="py-4 disabled:bg-gray-800 disabled:text-gray-600 hover:bg-opacity-90 bg-teal-300 text-black text-lg w-full font-bold my-2"
                  >
                    {errors.inputAmount ? errors.inputAmount : "Error"}
                  </button>
                )}
                {!!values.inputAmount &&
                  isValid &&
                  createDecimal(values.inputAmount) !== null &&
                  !new Decimal(values.inputAmount).isZero() &&
                  (!values.locked || values.locked === null) && (
                    <>
                      <button
                        disabled={!isValid}
                        onClick={() => setStep(2)}
                        type="button"
                        className="py-4 disabled:bg-gray-800 disabled:text-gray-600 hover:bg-opacity-90 bg-teal-300 text-black text-lg w-full font-bold my-2"
                      >
                        {errors.inputAmount
                          ? errors.inputAmount
                          : "Review Swap"}
                      </button>
                      <GasFeeEstimator />
                    </>
                  )}
              </>

              <ReviewSwap
                error={error}
                step={step}
                setStep={setStep}
                submitForm={submitForm}
              />
            </form>
          </QuoteContextProvider>
        )}
      </Formik>
    </div>
  );
};

export default SwapWidget;
