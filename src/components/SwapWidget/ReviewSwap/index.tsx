import { FormikContextType, FormikValues, useFormikContext } from "formik";
import AnimatedDialog from "../../UI/AnimatedDialog";
import Cross from "../../UI/Cross";
import calculateRate from "../libs/calculateRate";
import Decimal from "decimal.js";
import Maximize from "../../UI/Icons/Maximize";
import Minimize from "../../UI/Icons/Minimize";
import { animated, useSpring } from "react-spring";
import { useContext, useEffect, useRef, useState } from "react";
import { appContext } from "../../../AppContext";
import WarningIcon from "../../UI/Icons/WarningIcon";

import Swapping from "../../UI/Lottie/Swapping.json";
import Success from "../../UI/Lottie/Success.json";
import Lottie from "lottie-react";
import Signature from "../../UI/Icons/Signature";
import ArrowDown from "../../UI/Icons/ArrowDown";
import SwapIcon from "../../UI/Icons/SwapIcon";
import RightArrow from "../../UI/Icons/RightArrow";

const ReviewSwap = ({ error, clearError, step, setStep, ledgerContext }) => {
  const { swapWidgetSettings, _currentAccount } = useContext(appContext);
  const formik: FormikContextType<FormikValues> = useFormikContext();
  const { isSubmitting, submitForm, resetForm } = formik;
  const { inputAmount, tokenA, outputAmount, tokenB, gas, receipt } =
    formik.values;
  // State to manage the visibility of the hidden section
  const [pricesUpdated, setPricesUpdated] = useState(true);

  const [showMore, setShowMore] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  // Ref to store initial values
  const initialValuesRef = useRef<{ inputAmount: string, outputAmount: string } | null>(null);

  const expandAnimation = useSpring({
    opacity: showMore ? 1 : 0,
    height: showMore ? contentRef.current?.scrollHeight : 0,
    config: { tension: 250, friction: 30 },
  });

  useEffect(() => {
    // Store initial values on first render
    if (initialValuesRef.current === null) {
      initialValuesRef.current = {
        inputAmount,
        outputAmount,
      };
    }

    
  }, [inputAmount, outputAmount]);
  
  
  useEffect(() => {
    // Check if the current values are different from initial values
    if (initialValuesRef.current) {
      const initialInputAmount = initialValuesRef.current.inputAmount;
      const initialOutputAmount = initialValuesRef.current.outputAmount;

      if (
        inputAmount !== initialInputAmount ||
        outputAmount !== initialOutputAmount
      ) {
        setPricesUpdated(true);
      } else {
        setPricesUpdated(false);
      }
    }

    return () => {
      if (initialValuesRef.current) {
        initialValuesRef.current = null;
      }
    }
  }, [inputAmount, outputAmount]);

  // Handle rendering state to ensure content mounts/unmounts correctly
  useEffect(() => {
    if (showMore && contentRef.current) {
      contentRef.current.style.height = `${contentRef.current.scrollHeight}px`;
    }
  }, [showMore]);

  const slippage =
    swapWidgetSettings &&
    swapWidgetSettings.slippage &&
    swapWidgetSettings.slippage !== null
      ? swapWidgetSettings.slippage
      : 0.5; // Default slippage to 0 if not available

  // Calculate slippage as a percentage of outputAmount
  const slippageAmount = (slippage / 100) * outputAmount;

  // Calculate the amount to receive after accounting for slippage
  const receiveAtLeast = outputAmount - slippageAmount;

  return (
    <AnimatedDialog up={2000} display={step > 1} dismiss={() => null}>
      <>
        <div className={`grid grid-cols-[1fr_auto] items-center mx-auto ${error ? "max-w-lg" : "max-w-sm"}`}>
          <h3 className="px-4 text-base font-bold text-center">
            {!error && step === 2 && "Review Swap"}
            {error && "Transaction Failed"}
            {step === 4 && "Transaction Submitted"}
          </h3>
          {(ledgerContext || step !== 3) && (
            <Cross
              dismiss={() => {
                // reset
                setPricesUpdated(false);
                
                if (ledgerContext || step !== 3) {
                  setStep(1);
                  clearError();                  
                }

                if (step === 4) {
                  setStep(1);
                  resetForm();
                }
              }}
            />
          )}
        </div>

        <div className={`mt-8 max-w-sm mx-auto ${error ? "max-w-lg" : "max-w-sm"}`}>
          {!error && (
            <>
              {step === 2 && (
                <>
                  <div className="bg-neutral-50 bg-opacity-50 dark:bg-[#1B1B1B] rounded-lg px-4 py-3">
                    <span className="dark:text-neutral-600 font-bold text-sm">
                      Sell
                    </span>
                    <div className="grid grid-cols-[1fr_auto] items-center">
                      <p className="dark:text-neutral-100 tracking-widest font-bold text-xl truncate">
                        {inputAmount} {tokenA.token.symbol}
                      </p>

                      <img
                        className="w-12 h-12 rounded-full"
                        src={
                          tokenA.token.symbol === "WMINIMA"
                            ? "./assets/wtoken.svg"
                            : "./assets/tether.svg"
                        }
                      />
                    </div>
                  </div>

                  <div className="bg-neutral-50 bg-opacity-50 dark:bg-[#1B1B1B] rounded-lg px-4 py-3 mt-4">
                    <span className="dark:text-neutral-600 font-bold text-sm">
                      Buy
                    </span>
                    <div className="grid grid-cols-[1fr_auto] items-center">
                      <p className="dark:text-neutral-100 tracking-widest font-bold text-xl truncate">
                        {outputAmount} {tokenB.token.symbol}
                      </p>

                      <img
                        className="w-12 h-12 rounded-full"
                        src={
                          tokenB.token.symbol === "WMINIMA"
                            ? "./assets/wtoken.svg"
                            : "./assets/tether.svg"
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-[1fr_auto_1fr] items-center">
                    <hr className="border border-neutral-900 my-6 w-full" />
                    <span
                      onClick={() => setShowMore((prevState) => !prevState)}
                      className="mx-4 text-xs font-bold text-black dark:text-neutral-300 flex items-cneter gap-1"
                    >
                      {showMore ? "Hide Details" : "Show More"}{" "}
                      {!showMore && (
                        <Maximize size={14} extraClass="" fill="currentColor" />
                      )}{" "}
                      {showMore && (
                        <Minimize size={14} extraClass="" fill="currentColor" />
                      )}
                    </span>
                    <hr className="border border-neutral-900 my-6 w-full" />
                  </div>

                  <div className="my-4">
                    <div className="grid grid-cols-[1fr_auto] items-center font-bold">
                      <h6 className="dark:text-neutral-500">Rate</h6>
                      <p className="text-sm dark:text-neutral-100">
                        1 {tokenA.token.symbol} ={" "}
                        {calculateRate(inputAmount, outputAmount).toFixed(4)}{" "}
                        {tokenB.token.symbol}
                      </p>
                    </div>

                    <animated.div
                      style={expandAnimation}
                      ref={contentRef}
                      className="overflow-hidden"
                    >
                      <>
                        <div className="grid grid-cols-[1fr_auto] items-center font-bold">
                          <h6 className="dark:text-neutral-500">
                            Max Slippage
                          </h6>
                          <p className="text-sm dark:text-neutral-100">
                            {slippage}%
                          </p>
                        </div>

                        <div className="grid grid-cols-[1fr_auto] items-center font-bold">
                          <h6 className="dark:text-neutral-500">
                            Receive at least
                          </h6>
                          <p className="text-sm dark:text-neutral-100">
                            {receiveAtLeast
                              ? new Decimal(receiveAtLeast).toFixed(
                                  tokenB.token.decimals > 6 ? 18 : 6
                                )
                              : outputAmount}{" "}
                            {tokenB.token.symbol}
                          </p>
                        </div>
                      </>
                    </animated.div>

                    <div className="grid grid-cols-[1fr_auto] items-center font-bold">
                      <h6 className="dark:text-neutral-500">Network Cost</h6>
                      <p className="text-sm dark:text-neutral-100">
                        {gas && new Decimal(gas.toString()).toFixed(0)} GWEI
                      </p>
                    </div>
                  </div>

                  <div
                    className={`py-1 px-1 grid grid-cols-1 ${
                      pricesUpdated &&
                      "bg-yellow-100 grid-cols-2 dark:bg-neutral-950 rounded-lg"
                    }`}
                  >
                    {pricesUpdated && (
                      <div className="my-auto flex gap-2 items-center">
                        <span className="dark:text-neutral-300 pl-2">
                          <WarningIcon
                            extraClass=""
                            fill="currentColor"
                            size={16}
                          />
                        </span>
                        <p className="text-xs text-neutral-600 dark:text-neutral-300 font-bold">
                          Prices Changed
                        </p>
                      </div>
                    )}
                    <div>
                      <button
                        onClick={() => {
                          submitForm();
                        }}
                        type="button"
                        className="font-bold text-neutral-100 bg-neutral-800 border border-neutral-500 dark:border-none dark:bg-[#1B1B1B] w-full py-4 tracking-wide dark:text-neutral-100 dark:disabled:text-neutral-500 rounded-full"
                      >
                        {_currentAccount &&
                          _currentAccount.type === "ledger" &&
                          "Sign &"}{" "}
                        Swap
                      </button>
                    </div>
                  </div>
                </>
              )}

              {isSubmitting && step === 3 && ledgerContext && (
                <div>
                  <div className=" bg-neutral-50 bg-opacity-50 dark:bg-[#1B1B1B] rounded-lg px-4 py-3">
                    <span className="dark:text-neutral-600 font-bold text-sm">
                      Sell
                    </span>
                    <div className="grid grid-cols-[1fr_auto] items-center">
                      <p className="dark:text-neutral-100 tracking-widest font-bold text-xl truncate">
                        {inputAmount} {tokenA.token.symbol}
                      </p>

                      <img
                        className="w-12 h-12 rounded-full"
                        src={
                          tokenA.token.symbol === "WMINIMA"
                            ? "./assets/wtoken.svg"
                            : "./assets/tether.svg"
                        }
                      />
                    </div>
                  </div>

                  <div className="bg-neutral-50 bg-opacity-50 dark:bg-[#1B1B1B] rounded-lg px-4 py-3 mt-4">
                    <span className="dark:text-neutral-600 font-bold text-sm">
                      Buy
                    </span>
                    <div className="grid grid-cols-[1fr_auto] items-center">
                      <p className="dark:text-neutral-100 tracking-widest font-bold text-xl truncate">
                        {outputAmount} {tokenB.token.symbol}
                      </p>

                      <img
                        className="w-12 h-12 rounded-full"
                        src={
                          tokenB.token.symbol === "WMINIMA"
                            ? "./assets/wtoken.svg"
                            : "./assets/tether.svg"
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-[1fr_auto_1fr] items-center">
                    <hr className="border border-neutral-900 my-6 w-full" />
                    <span className="mx-4 text-xs font-bold text-black dark:text-neutral-300 flex items-cneter gap-1">
                      Sign & Swap
                    </span>
                    <hr className="border border-neutral-900 my-6 w-full" />
                  </div>

                  <div className="my-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`bg-pink-600 text-white dark:text-black dark:bg-pink-700 w-max p-2 rounded-full ${
                          ledgerContext === "waiting" && "animate-pulse"
                        }`}
                      >
                        <Signature
                          extraClass=""
                          size={20}
                          fill="currentColor"
                        />
                      </div>
                      <p
                        className={`text-xs dark:text-neutral-200 font-bold ${
                          ledgerContext === "success" &&
                          "text-pink-600 dark:text-pink-700"
                        }`}
                      >
                        {ledgerContext === "waiting" &&
                          "Awaiting your signature"}
                        {ledgerContext === "success" && "Signed successfully"}
                      </p>
                    </div>
                    <div className="w-max ml-2 my-1 dark:text-neutral-300">
                      <ArrowDown extraClass="" fill="currentColor" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`text-neutral-400 bg-neutral-300 dark:bg-neutral-900 w-max p-2 rounded-full ${
                          ledgerContext === "success" &&
                          "!text-white dark:!text-black !bg-teal-700 dark:!bg-teal-900 animate-pulse"
                        }`}
                      >
                        <SwapIcon size={20} />
                      </div>
                      <p
                        className={`text-xs text-neutral-400 dark:text-neutral-600 font-bold ${
                          ledgerContext === "rejected" &&
                          "!text-red-700 dark:!text-red-900"
                        } ${
                          ledgerContext === "success" &&
                          "!text-black dark:!text-teal-600"
                        }`}
                      >
                        {ledgerContext === "waiting" && "Confirm Swap"}
                        {ledgerContext === "success" && "Swap confirmed"}
                        {ledgerContext === "rejected" && "Rejected"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isSubmitting && step === 3 && !ledgerContext && (
                <div className="grid">
                  <Lottie
                    className="w-[220px] h-[210px] self-center place-self-center justify-self-center"
                    animationData={Swapping}
                    loop={true}
                  />

                  <p className=" text-center dark:text-neutral-200 font-bold">
                    Swapping tokens...
                  </p>
                </div>
              )}
              {step === 4 && (
                <div className="grid">
                  <Lottie
                    className="w-[140px] h-[140px] self-center place-self-center justify-self-center dark:grayscale-[95%]"
                    animationData={Success}
                    loop={true}
                  />

                  <div className="grid grid-cols-[1fr_auto_1fr] gap-1 my-8">
                    <div className="text-center">
                      <div className="grid grid-cols-[1fr_auto] items-center">
                        <p className="dark:text-neutral-100 tracking-widest font-bold text-xs truncate">
                          {inputAmount} {tokenA.token.symbol}
                        </p>

                        <img
                          className="w-6 h-6 rounded-full"
                          src={
                            tokenA.token.symbol === "WMINIMA"
                              ? "./assets/wtoken.svg"
                              : "./assets/tether.svg"
                          }
                        />
                      </div>
                    </div>

                    <div className="mx-2 text-neutral-900 dark:text-neutral-100">
                      <RightArrow extraClass="" size={20} fill="currentColor" />
                    </div>

                    <div className="text-center">
                      <div className="grid grid-cols-[1fr_auto] items-center">
                        <p className="dark:text-neutral-100 tracking-widest font-bold text-xs truncate">
                          {outputAmount} {tokenB.token.symbol}
                        </p>

                        <img
                          className="w-6 h-6 rounded-full"
                          src={
                            tokenB.token.symbol === "WMINIMA"
                              ? "./assets/wtoken.svg"
                              : "./assets/tether.svg"
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 items-center">
                    <hr className="border border-neutral-300 dark:border-neutral-900 mb-3 w-full" />
                  </div>

                  <div className="text-center">
                    <a
                      onClick={(e) => {
                        if (!receipt) return;

                        if (
                          window.navigator.userAgent.includes("Minima Browser")
                        ) {
                          e.preventDefault();
                          // @ts-ignore
                          Android.openExternalBrowser(
                            `https://etherscan.io/tx/${receipt.hash}`
                          );
                        }
                      }}
                      href={`${receipt && `https://etherscan.io/tx/${receipt.hash}`}`}
                      target="_blank"
                      className="font-bold text-sm cursor-pointer !text-sky-600 dark:text-sky-900 active:text-neutral-300 active:dark:text-neutral-500"
                    >
                      View on Etherscan
                    </a>
                  </div>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="overflow-y-auto max-h-[400px]">
              <p className="dark:text-neutral-500 break-all">{error}</p>
            </div>
          )}
        </div>
      </>
    </AnimatedDialog>
  );
};

export default ReviewSwap;
