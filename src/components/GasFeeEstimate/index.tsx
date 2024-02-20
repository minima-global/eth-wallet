import ConversionRateUSD from "../ConversionRateUSD";
import { useGasContext } from "../../providers/GasProvider";
import { useFormikContext } from "formik";
import { useEffect } from "react";
import { useSpring, animated, config } from "react-spring";
import Dialog from "../UI/Dialog";
import { createPortal } from "react-dom";
import GasCard from "./GasCard";
import Decimal from "decimal.js";

/**
 * @EIP1559
 * Calculating gas fee as with EIP1559,
 * (BASE FEE + PRIORITY FEE) X UNITS OF GAS USED
 */

function GasEstimation() {
  const formik: any = useFormikContext();
  const {
    defaultGas,
    loading,
    gas,
    gasCard,
    estimateGas,
    promptGasCards,
    showGasCards,
    transactionTotal,
    clearGas,
    asset,
  } = useGasContext();

  const springProps = useSpring({
    opacity: showGasCards ? 1 : 0,
    transform: showGasCards
      ? "translateY(0%) scale(1)"
      : "translateY(-50%) scale(0.8)",
    config: config.wobbly,
  });

  useEffect(() => {
    estimateGas(
      formik.values.amount,
      formik.values.address,
      formik.values.asset
    );

    const intervalled = setInterval(
      () =>
        estimateGas(
          formik.values.amount,
          formik.values.address,
          formik.values.asset
        ),
      15000
    );

    return () => {
      clearInterval(intervalled);
      clearGas();
    };
  }, [defaultGas]);

  return (
    <div>
      {showGasCards &&
        createPortal(
          <Dialog extraClass="z-[80]">
            <div className="h-[calc(100vh_-_64px)] grid items-start pt-[80px]">
              <animated.div style={springProps}>
                <div className=" bg-white shadow-lg shadow-slate-300 dark:shadow-sm dark:bg-black w-[calc(100%_-_16px)] md:w-full p-4 pb-2 px-0 rounded mx-auto">
                  <div className="flex justify-between pr-4">
                    <h3 className="mx-4 font-bold">Gas Station</h3>
                    <svg
                      onClick={promptGasCards}
                      xmlns="http://www.w3.org/2000/svg"
                      className="hover:cursor-pointer"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M18 6l-12 12" />
                      <path d="M6 6l12 12" />
                    </svg>
                  </div>
                  <div className="grid grid-cols-3 mx-4 text-sm">
                    <h3>Gas option</h3>
                    <h3>Time</h3>
                    <h3>Max fee (ETH)</h3>
                  </div>
                  {gas && gas.gasUnits && (
                    <div className="flex flex-col gap-2 mt-4 px-4">
                      <GasCard
                        gasUnit={BigInt(gas!.gasUnits)}
                        type="low"
                        card={gasCard!.low}
                      />
                      <GasCard
                        gasUnit={BigInt(gas!.gasUnits)}
                        type="medium"
                        card={gasCard!.medium}
                      />
                      <GasCard
                        gasUnit={BigInt(gas!.gasUnits)}
                        type="high"
                        card={gasCard!.high}
                      />
                    </div>
                  )}
                  <div className="px-4">
                    <hr className="h-px my-2 bg-gray-200 border-0 dark:bg-gray-700" />
                    <h3 className="pb-2 font-bold text-sm text-center border-b text-orange-500">
                      Network Status
                    </h3>
                    <div className="grid grid-cols-2 divide-x">
                      <div className="text-center py-1">
                        <p>
                          {new Decimal(gasCard!.estimatedBaseFee)
                            .toDecimalPlaces(0)
                            .toString()}{" "}
                          GWEI
                        </p>
                        <h3 className="text-sm font-bold">Base Fee</h3>
                      </div>
                      <div className="text-center py-1">
                        <p>
                          {new Decimal(gasCard!.latestPriorityFeeRange[0])
                            .toDecimalPlaces(1)
                            .toString()}{" "}
                          -{" "}
                          {new Decimal(gasCard!.latestPriorityFeeRange[1])
                            .toDecimalPlaces(1)
                            .toString()}{" "}
                          GWEI
                        </p>
                        <h3 className="text-sm font-bold">Priority range</h3>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <a className="m-0 p-0 text-sm py-1" href="https://support.metamask.io/hc/en-us/articles/4404600179227-User-Guide-Gas">
                      Learn more about gas
                    </a>

                  </div>
                </div>
              </animated.div>
            </div>
          </Dialog>,
          document.body
        )}
      <div className="flex justify-between items-center mx-4">
        <div />
        <div>
          <svg
            onClick={promptGasCards}
            className="cursor-pointer"
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            stroke-width="2.0"
            stroke="currentColor"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M14 11h1a2 2 0 0 1 2 2v3a1.5 1.5 0 0 0 3 0v-7l-3 -3" />
            <path d="M4 20v-14a2 2 0 0 1 2 -2h6a2 2 0 0 1 2 2v14" />
            <path d="M3 20l12 0" />
            <path d="M18 7v1a1 1 0 0 0 1 1h1" />
            <path d="M4 11l10 0" />
          </svg>
        </div>
      </div>

      <div
        className={`flex justify-between items-center mx-4 ${
          loading ? "animate-pulse temporary-pulse" : ""
        }`}
      >
        <h3 className="font-bold">Gas Fee</h3>

        {!gas && loading ? (
          <Spinner />
        ) : gas && gas.finalGasFee ? (
          <div className="text-right">
            <p className="text-sm">{gas.finalGasFee}</p>
            <ConversionRateUSD
              amount={gas.finalGasFee ? gas.finalGasFee : "0"}
              asset={asset}
            />
          </div>
        ) : (
          "N/A"
        )}
      </div>
      <div
        className={`mt-4 flex justify-between items-center mx-4 ${
          loading ? "animate-pulse temporary-pulse" : ""
        }`}
      >
        <h3 className="font-bold">Total</h3>
        <div>
          {!transactionTotal && loading ? (
            <Spinner />
          ) : transactionTotal && transactionTotal.length ? (
            <p className="font-bold text-right">{transactionTotal}</p>
          ) : (
            "N/A"
          )}

          <div className="text-right text-teal-500">
            <ConversionRateUSD
              amount={transactionTotal ? transactionTotal : "0"}
              asset={asset}
            />
          </div>
        </div>
      </div>
      {loading && (
        <div className="mx-4 flex items-center justify-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="animate-spin"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
            stroke="#8b5cf6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M10 20.777a8.942 8.942 0 0 1 -2.48 -.969" />
            <path d="M14 3.223a9.003 9.003 0 0 1 0 17.554" />
            <path d="M4.579 17.093a8.961 8.961 0 0 1 -1.227 -2.592" />
            <path d="M3.124 10.5c.16 -.95 .468 -1.85 .9 -2.675l.169 -.305" />
            <path d="M6.907 4.579a8.954 8.954 0 0 1 3.093 -1.356" />
            <path d="M12 9l-2 3h4l-2 3" />
          </svg>
          <p className="text-sm font-bold">Calculating new fee...</p>
        </div>
      )}
    </div>
  );
}

export default GasEstimation;

const Spinner = () => {
  return (
    <div className="flex justify-end">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="animate-spin "
        width="16"
        height="16"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M10 20.777a8.942 8.942 0 0 1 -2.48 -.969" />
        <path d="M14 3.223a9.003 9.003 0 0 1 0 17.554" />
        <path d="M4.579 17.093a8.961 8.961 0 0 1 -1.227 -2.592" />
        <path d="M3.124 10.5c.16 -.95 .468 -1.85 .9 -2.675l.169 -.305" />
        <path d="M6.907 4.579a8.954 8.954 0 0 1 3.093 -1.356" />
      </svg>
    </div>
  );
};
