import { Formik } from "formik";
import FieldWrapper from "./FieldWrapper";
import SwapDirection from "./SwapDirection";
import { useTokenStoreContext } from "../../providers/TokenStoreProvider";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";
import { _defaults } from "../../constants";
import { QuoteContextProvider } from "../../providers/QuoteProvider/QuoteProvider";
import * as yup from "yup";
import { SUPPORTED_CHAINS, Token } from "@uniswap/sdk-core";

import { useContext, useEffect, useState } from "react";
import { appContext } from "../../AppContext";
import Decimal from "decimal.js";
import { MaxUint256, parseUnits } from "ethers";
import GasFeeEstimator from "./GasFeeEstimator";
import { createDecimal } from "../../utils";
import ReviewSwap from "./ReviewSwap";
import getTokenWrapper from "./libs/getTokenWrapper";
import useAllowanceChecker from "../../hooks/useAllowanceChecker";
import Allowance from "./Allowance";

const SwapWidget = () => {
  // Check if we have enough allowance to then show the appropriate button..
  useAllowanceChecker();

  const { _network } = useWalletContext();

  const {
    promptAllowanceApprovalModal,
    setTriggerBalanceUpdate,
    swapDirection,
    _allowanceLock,
    setPromptAllowance,
  } = useContext(appContext);
  const { _wallet, _balance, getEthereumBalance } = useWalletContext();
  const { tokens } = useTokenStoreContext();

  const [step, setStep] = useState(1);
  const [error, setError] = useState<false | string>(false);

  const handlePullBalance = async () => {
    // wait 3s before pulling balance for erc20 & eth
    await new Promise((resolve) => {
      setTimeout(resolve, 3000);
    });

    setTriggerBalanceUpdate(true);
    getEthereumBalance();

    setTimeout(() => {
      setTriggerBalanceUpdate(false);
    }, 2000);
  };

  useEffect(() => {
    (async () => {
      await handlePullBalance();
    })();
  }, [_network, step, swapDirection]);

  if (_network !== "mainnet") {
    return (
      <p className="text-xs opacity-80 text-center">
        This feature is only available on mainnet.
      </p>
    );
  }

  return (
    <Formik
      validationSchema={yup.object().shape({
        inputAmount: yup
          .string()
          .required("Enter an amount")
          .matches(/^\d+(\.\d+)?$/, "Invalid amount")
          .test("check for insufficient funds", function (val) {
            const { path, parent, createError } = this;

            if (!val || val.length === 0) return false;
            
            try {
              const relevantToken = tokens.find((tkn) => tkn.address === parent.input.address);

              if (!relevantToken) {
                return;
              }
                          
              if (new Decimal(relevantToken!.balance).isZero()) {
                return createError({
                  path,
                  message: "Insufficient funds",
                });
              }
              
              const decimalVal = createDecimal(val);
              if (decimalVal === null) {
                throw new Error("Invalid amount`");
              }

              const spendAmount = decimalVal.times(10 ** parent.input.decimals);

              if (spendAmount.gt(MaxUint256.toString())) {
                throw new Error("You exceeded the max amount");
              }

              if (spendAmount.greaterThan(relevantToken!.balance)) {
                throw new Error("Insufficient funds");
              }

              if (new Decimal(val).decimalPlaces() > parent.input.decimals) {
                throw new Error("Too many decimals")
              }

              return true;
            } catch (error) {
              
              if (error instanceof Error) {
                return createError({
                  path,
                  message: error.message,
                });
              }

              return false;
            }
          }),
        gas: yup
          .string()
          .required("Gas is required")
          .test("has sufficient funds to pay for gas", function (val) {
            const { path, createError } = this;

            if (!val || val.length === 0) return false;

            
            try {
              // We check whether the user has enough funds to pay for gas.
              if (new Decimal(_balance).isZero()) {
                return createError({
                  path,
                  message: "Insufficient funds, low on ETH for gas",
                });
              }
              const decimalVal = createDecimal(val);
              if (decimalVal === null) {
                throw new Error("Invalid gas amount");
              }

              // spendAmount is in Ethereum..

              if (
                new Decimal(parseUnits(val, "gwei").toString()).greaterThan(
                  parseUnits(_balance, "ether").toString()
                )
              ) {
                throw new Error("Insufficient funds, low on ETH for gas");
              }

              return true;
            } catch (error: any) {
              // console.error(error);
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
        inputAmount: "",
        outputAmount: "",
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
          setFieldValue("locked", true);
          const res = await _wallet!.sendTransaction(tx);

          const receipt = await res.wait();
          setFieldValue("receipt", receipt);

          setStep(4);
          await handlePullBalance();
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
      {({ values, isValid, errors, handleSubmit, handleBlur, submitForm }) => (
        <QuoteContextProvider>
          <Allowance />

          <form onSubmit={handleSubmit} className="relative">
            <>
              <FieldWrapper
              handleBlur={handleBlur}
                disabled={!!values.locked}
                type="input"
                balance={
                  tokens &&
                  tokens.find((tkn) => tkn.address === values.input!.address)
                    ? tokens.find(
                        (tkn) => tkn.address === values.input!.address
                      )!.balance
                    : ""
                }
                decimals={values.input?.decimals}
                token={
                  <>{values.input ? getTokenWrapper(values.input) : null}</>
                }
              />
              <SwapDirection />
              <FieldWrapper
                handleBlur={handleBlur}
                disabled={!!values.locked}
                extraClass="mt-1"
                type="output"
                balance={
                  tokens &&
                  tokens.find((tkn) => tkn.address === values.output!.address)
                    ? tokens.find(
                        (tkn) => tkn.address === values.output!.address
                      )!.balance
                    : ""
                }
                decimals={values.output?.decimals}
                token={
                  <>{values.output ? getTokenWrapper(values.output) : null}</>
                }
              />
              {/* If widget is locked then we need to approve.. */}
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
              {/* If widget is not locked and there is an error then show error.. */}
              {!values.locked && errors.inputAmount && (
                <button
                  disabled={!isValid}
                  type="submit"
                  className="bg-opacity-50 w-full tracking-wider font-bold p-4 bg-teal-500 dark:bg-teal-300 text-white mt-4 dark:text-black"
                >
                  {errors.inputAmount ? errors.inputAmount : "Error"}
                </button>
              )}

              {/* If widget is not locked && there are no errors.. then show review button! */}
              {!errors.inputAmount &&
                createDecimal(values.inputAmount) !== null &&
                !new Decimal(values.inputAmount).isZero() &&
                !_allowanceLock && (
                  <>
                    <button
                      disabled={!!errors.inputAmount}
                      onClick={() => setStep(2)}
                      type="button"
                      className="w-full tracking-wider font-bold p-4 bg-teal-500 dark:bg-teal-300 text-white mt-4 dark:text-black"
                    >
                      {errors.inputAmount ? errors.inputAmount : "Review Swap"}
                    </button>

                    <GasFeeEstimator />
                  </>
                )}

              {_allowanceLock && (
                <button
                  onClick={() => setPromptAllowance(true)}
                  type="button"
                  className="mt-4 w-full bg-violet-500 p-3 font-bold text-white dark:text-black trailing-wider"
                >
                  Approve allowances
                </button>
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
  );
};

export default SwapWidget;
