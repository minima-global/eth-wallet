import ConversionRateUSD from "../ConversionRateUSD";
import { useGasContext } from "../../providers/GasProvider";
import { useFormikContext } from "formik";
import { useContext, useEffect, useState } from "react";
import { useSpring, animated, config } from "react-spring";
import Dialog from "../UI/Dialog";
import { createPortal } from "react-dom";
// import GasCard from "./GasCard";
import Decimal from "decimal.js";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";
import { appContext } from "../../AppContext";
import useGasInfo from "../../hooks/useGasInfo";

import * as utils from "../../utils";
import { GasFeeCalculated } from "../../types/GasFeeInterface";
import GasCard from "./GasCard";

/**
 * @EIP1559
 * Calculating gas fee as with EIP1559,
 * (BASE FEE + PRIORITY FEE) X UNITS OF GAS USED
 */

function GasEstimation() {
  const formik: any = useFormikContext();
  const { _network } = useWalletContext();
  const [gas, setGas] = useState<GasFeeCalculated | null>(null);
  
  const {
    level,
    loading,
    showGasCards,
    estimateGas,
    promptGasCards,
  } = useGasContext();
  const { gasInfo, gasCardData } = useGasInfo(3, level);
  const { _defaultNetworks, _currentNetwork } = useContext(appContext);

  const springProps = useSpring({
    opacity: showGasCards ? 1 : 0,
    transform: showGasCards
      ? "translateY(0%) scale(1)"
      : "translateY(-50%) scale(0.8)",
    config: config.stiff,
  });

  
  useEffect(() => {
    const calculateFinalGasPrice = async () => {
      try {
        if (!gasInfo) {
          return;
        }
  
        // we have here the gas units required for transfer
        const gasUnits = await estimateGas(
          formik.values.amount,
          formik.values.address,
          formik.values.asset
        );
  
        const { suggestedMaxFeePerGas, suggestedMaxPriorityFeePerGas } = gasInfo;
  
        // we have the gas price, getting sequential updates..
  
        const finalGas = await utils.calculateGasFee(
          gasUnits!,
          suggestedMaxFeePerGas,
          suggestedMaxPriorityFeePerGas
        );

        setGas(finalGas);
      } catch (error) {
        console.error(error);
        setGas(null);
      }
    };
    // calculate according to current gas price
    calculateFinalGasPrice();
  }, [gasInfo]);

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
                  {loading && (
                    <div className="my-4 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="animate-spin mr-2"
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
                        <path d="M10 20.777a8.942 8.942 0 0 1 -2.48 -.969" />
                        <path d="M14 3.223a9.003 9.003 0 0 1 0 17.554" />
                        <path d="M4.579 17.093a8.961 8.961 0 0 1 -1.227 -2.592" />
                        <path d="M3.124 10.5c.16 -.95 .468 -1.85 .9 -2.675l.169 -.305" />
                        <path d="M6.907 4.579a8.954 8.954 0 0 1 3.093 -1.356" />
                        <path d="M12 9l-2 3h4l-2 3" />
                      </svg>
                      <p className="animate-pulse">Calculating...</p>
                    </div>
                  )}
                  {!loading && (
                    <>
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
                            card={gasCardData!.low}
                          />
                          <GasCard
                            gasUnit={BigInt(gas!.gasUnits)}
                            type="medium"
                            card={gasCardData!.medium}
                          />
                          <GasCard
                            gasUnit={BigInt(gas!.gasUnits)}
                            type="high"
                            card={gasCardData!.high}
                          />
                        </div>
                      )}
                    </>
                  )}
                  <div className="px-4">
                    <hr className="h-px my-2 bg-gray-200 border-0 dark:bg-gray-700" />
                    <h3 className="pb-2 font-bold text-sm text-center border-b text-orange-500">
                      Network Status
                    </h3>
                    <div className="grid grid-cols-2 divide-x">
                      <div className="text-center py-1">
                        <p>
                          {utils.createDecimal(gasCardData!.estimatedBaseFee) !== null && new Decimal(gasCardData!.estimatedBaseFee)
                            .toDecimalPlaces(0)
                            .toString()}{" "}
                          GWEI
                        </p>
                        <h3 className="text-sm font-bold">Base Fee</h3>
                      </div>
                      <div className="text-center py-1">
                        <p>
                          {utils.createDecimal(gasCardData!.latestPriorityFeeRange[0]) !== null && new Decimal(gasCardData!.latestPriorityFeeRange[0])
                            .toDecimalPlaces(1)
                            .toString()}{" "}
                          -{" "}
                          {utils.createDecimal(gasCardData!.latestPriorityFeeRange[1]) !== null && new Decimal(gasCardData!.latestPriorityFeeRange[1])
                            .toDecimalPlaces(1)
                            .toString()}{" "}
                          GWEI
                        </p>
                        <h3 className="text-sm font-bold">Priority range</h3>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <a
                      className="m-0 p-0 text-sm py-1"
                      href="https://support.metamask.io/hc/en-us/articles/4404600179227-User-Guide-Gas"
                    >
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
        {_network === "mainnet" ||
        _network === "sepolia" ||
        _network === "goerli" ? (
          <div>
            <svg
              onClick={promptGasCards}
              className="cursor-pointer"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              strokeWidth="2.0"
              stroke="currentColor"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M14 11h1a2 2 0 0 1 2 2v3a1.5 1.5 0 0 0 3 0v-7l-3 -3" />
              <path d="M4 20v-14a2 2 0 0 1 2 -2h6a2 2 0 0 1 2 2v14" />
              <path d="M3 20l12 0" />
              <path d="M18 7v1a1 1 0 0 0 1 1h1" />
              <path d="M4 11l10 0" />
            </svg>
          </div>
        ) : (
          <div />
        )}
      </div>

      {!gasInfo && !loading && <p className="text-xs text-center">Awaiting Gas Information...</p>}

      {!!gasInfo && (
        <>
          <div
            className={`flex justify-between items-center mx-4 ${
              loading ? "animate-pulse temporary-pulse" : ""
            }`}
          >
            <h3 className="font-bold">Gas Fee <span className={`${level === 'high' && "text-violet-500"} ${level === 'low' && "text-sky-500"} ${level === 'medium' && "text-neutral-700 dark:text-neutral-500"} text-xs`}>({level})</span></h3>

            {!gas && loading ? (
              <Spinner />
            ) : gas && gas.finalGasFee ? (
              <div className="text-right">
                <p className="text-sm">{gas.finalGasFee}</p>
                {/* <ConversionRateUSD
              amount={gas.finalGasFee ? gas.finalGasFee : "0"}
              asset={asset}
            /> */}
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
              {!gas && loading && <Spinner />}

              {gas && !loading && (
                <div className="text-right font-mono">
                  {formik.values.asset.type === "ether" && (
                    <div className="flex">
                      <h3 className="text-sm font-bold">
                        {utils.createDecimal(formik.values.amount) !== null && new Decimal(formik.values.amount)
                          .plus(gas.finalGasFee)
                          .toString()}{" "}
                        {_defaultNetworks[_currentNetwork].symbol}
                      </h3>
                      <ConversionRateUSD
                        amount={formik.values.amount}
                        asset={{ type: "ether" }}
                      />
                    </div>
                  )}

                  {formik.values.asset.type === "erc20" && (
                    <div>
                      <h3 className="font-mono text-sm font-bold">
                        {formik.values.amount} {formik.values.asset.symbol}
                      </h3>
                      <p className="font-mono text-sm">
                        {gas.finalGasFee}{" "}
                        <span className="font-bold">
                          {_defaultNetworks[_currentNetwork].symbol}
                        </span>
                      </p>
                      {/* <ConversionRateUSD
                    amount={gas.finalGasFee}
                    asset={{ type: "ether" }}
                  /> */}
                      {/* <ConversionRateUSD
                    amount={formik.values.amount}
                    asset={asset}
                  /> */}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

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
