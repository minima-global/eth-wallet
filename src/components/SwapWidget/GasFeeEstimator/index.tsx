import {
  FeeAmount,
  Pool,
  Route,
  SwapOptions,
  SwapRouter,
  Trade,
} from "@uniswap/v3-sdk";
import { FormikValues, FormikContextType, useFormikContext } from "formik";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import getOutputQuote from "../libs/getOutputQuote";
import { appContext } from "../../../AppContext";
import { CurrencyAmount, Percent, TradeType } from "@uniswap/sdk-core";
import { fromReadableAmount } from "../../../utils/swap";
import * as utils from "../../../utils";

import JSBI from "jsbi";
import { useWalletContext } from "../../../providers/WalletProvider/WalletProvider";
import { SWAP_ROUTER_ADDRESS } from "../../../providers/QuoteProvider/libs/constants";
import Decimal from "decimal.js";
import { useGasContext } from "../../../providers/GasProvider";
import calculateRate from "../libs/calculateRate";
import { animated, useSpring } from "react-spring";
import CaretDown from "../../UI/Icons/CaretDown";

const GasFeeEstimator = () => {
  const formik: FormikContextType<FormikValues> = useFormikContext();
  const { _provider, swapWidgetSettings } = useContext(appContext);

  const [showMore, setShowMore] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const { gasInfo } = useGasContext();

  const { _chainId, _address, _poolContract, _wallet } = useWalletContext();

  const { setFieldValue, setFieldError } = formik;
  const { tokenA, tokenB, inputAmount, outputAmount, gas, locked, inputMode } =
    formik.values;

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null); // only do this when the user has stopped typing etc.

  // Fetch the quote
  const fetchQuote = useCallback(async () => {
    if (
      !_poolContract ||
      locked ||
      (utils.createDecimal(inputAmount) === null &&
        utils.createDecimal(outputAmount) === null)
    )
      return;

    const [liquidity, slot0] = await Promise.all([
      _poolContract.liquidity(),
      _poolContract.slot0(),
    ]);

    const pool = new Pool(
      tokenA.token,
      tokenB.token,
      FeeAmount.HIGH,
      slot0[0].toString(),
      liquidity.toString(),
      parseInt(slot0[1])
    );

    const swapRoute = new Route(
      [pool],
      inputMode ? tokenA.token : tokenB.token,
      inputMode ? tokenB.token : tokenA.token
    );

    const quoteData = await getOutputQuote(
      inputMode ? tokenA.token : tokenB.token,
      inputMode ? inputAmount : outputAmount,
      swapRoute,
      _provider
    );

    const uncheckedTrade = Trade.createUncheckedTrade({
      route: swapRoute,
      inputAmount: CurrencyAmount.fromRawAmount(
        inputMode ? tokenA.token : tokenB.token,
        fromReadableAmount(
          inputMode ? inputAmount.toString() : outputAmount.toString(),
          inputMode ? tokenA.token.decimals : tokenB.token.decimals
        ).toString()
      ),
      outputAmount: CurrencyAmount.fromRawAmount(
        inputMode ? tokenB.token : tokenA.token,
        JSBI.BigInt(quoteData)
      ),
      tradeType: TradeType.EXACT_INPUT,
    });

    const deadline = (swapWidgetSettings && swapWidgetSettings.deadline) || 20;
    const slippage = (swapWidgetSettings && swapWidgetSettings.slippage) || 0.5;

    const slippageBips = Math.round(slippage * 100);
    const validSlippageBips = Math.max(0, Math.min(5000, slippageBips));

    const options: SwapOptions = {
      slippageTolerance: new Percent(validSlippageBips, 10_000),
      deadline: Math.floor(Date.now() / 1000) + 60 * deadline,
      recipient: _address!,
    };

    const methodParameters = SwapRouter.swapCallParameters(
      [uncheckedTrade],
      options
    );

    const feeData = await _provider.getFeeData();
    const { maxFeePerGas, maxPriorityFeePerGas } = feeData;

    const tx: any = {
      data: methodParameters.calldata,
      to: SWAP_ROUTER_ADDRESS,
      value: BigInt(methodParameters.value),
      chainId: BigInt(_chainId!),
      nonce: await _provider.getTransactionCount(_address),
    };

    try {
      const gasUnits = await _wallet!.estimateGas(tx);
      tx.gasLimit = BigInt(gasUnits);

      if (maxFeePerGas) {
        const _gas = await utils.calculateGasFee(
          gasUnits.toString(),
          maxFeePerGas.toString(),
          maxPriorityFeePerGas.toString()
        );

        tx.maxFeePerGas = BigInt(maxFeePerGas);
        tx.maxPriorityFeePerGas = BigInt(maxPriorityFeePerGas);
        setFieldValue("gas", _gas!.finalGasFee);
      }

      setFieldValue("tx", tx);
    } catch (error) {
      setFieldError("gas", "Need more ETH to pay for this swap");
    }
  }, [
    setFieldValue,
    setFieldError,
    gasInfo,
    _poolContract,
    locked,
    inputAmount,
    outputAmount,
    inputMode,
    _provider,
    tokenA.token,
    tokenB.token,
    _address,
    _chainId,
    swapWidgetSettings,
    _wallet,
  ]);

  // Helper to start the interval
  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      fetchQuote();
    }, 15000);
  }, [fetchQuote]);

  useEffect(() => {
    // Clear any previous debounce timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set a new debounce timeout
    debounceTimeout.current = setTimeout(() => {
      fetchQuote();

      // // Start the interval after the debounce finishes
      startInterval();
    }, 500); // Adjust the debounce delay

    // Clean up on unmount or when dependencies change
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [
    fetchQuote,
    locked,
    inputAmount,
    outputAmount,
    inputMode,
    gasInfo,
    _provider,
    tokenA.token,
    tokenB.token,
    _address,
    _chainId,
    swapWidgetSettings,
    _wallet,
    startInterval, // added as a dependency
  ]);

  const expandAnimation = useSpring({
    opacity: showMore ? 1 : 0,
    height: showMore ? contentRef.current?.scrollHeight : 0,
    config: { tension: 250, friction: 30 },
  });

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
    <>
      {gas && (
        <>
          <div
            className="grid grid-cols-[1fr_auto] items-center mt-2"
            onClick={() => setShowMore((prevState) => !prevState)}
          >
            <div>
              <p className="text-sm font-bold text-neutral-600 hover:text-neutral-700">
                1 {tokenA.token.symbol} ={" "}
                {calculateRate(inputAmount, outputAmount).toFixed(4)}{" "}
                {tokenB.token.symbol}
              </p>
            </div>
            <div className="grid grid-cols-[auto_auto_1fr_auto] items-center">
              {!showMore && (
                <>
                  <span className="text-black dark:text-neutral-400 my-auto">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="18"
                      viewBox="0 0 24 24"
                      strokeWidth="2.5"
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
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
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
                    <path d="M4 12c0 -1.657 1.592 -3 3.556 -3c1.963 0 3.11 1.5 4.444 3c1.333 1.5 2.48 3 4.444 3s3.556 -1.343 3.556 -3" />
                  </svg>
                  <p className="text-sm font-bold text-black dark:text-neutral-400">
                    <span className="font-mono">
                      {utils.createDecimal(gas) !== null &&
                        new Decimal(gas).toFixed(0)}
                    </span>{" "}
                    GWEI
                  </p>
                </>
              )}
              <span
                className={`${
                  showMore && "rotate-180"
                } transition-all ease-in-out text-neutral-700 dark:text-neutral-500`}
              >
                <CaretDown extraClass="" fill="currentColor" />
              </span>
            </div>
          </div>
          <animated.div
            style={expandAnimation}
            ref={contentRef}
            className="overflow-hidden"
          >
            <>
              <div className="grid grid-cols-[1fr_auto] items-center font-bold">
                <h6 className="dark:text-neutral-500">Max Slippage</h6>
                <p className="text-sm dark:text-neutral-100">{slippage}%</p>
              </div>

              <div className="grid grid-cols-[1fr_auto] items-center font-bold">
                <h6 className="dark:text-neutral-500">Network Fee</h6>
                <div className="flex gap-1">
                  <p className="text-sm dark:text-neutral-100">
                    {utils.createDecimal(gas) !== null &&
                      new Decimal(gas).toFixed(0)}{" "}
                    GWEI
                  </p>
                  <span className="text-black dark:text-neutral-400 my-auto">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="18"
                      viewBox="0 0 24 24"
                      strokeWidth="2.5"
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
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_auto] items-center font-bold">
                <h6 className="dark:text-neutral-500">Receive at least</h6>
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
        </>
      )}
    </>
  );
};

export default GasFeeEstimator;
