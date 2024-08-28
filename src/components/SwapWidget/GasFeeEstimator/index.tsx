import {
  FeeAmount,
  Pool,
  Route,
  SwapOptions,
  SwapRouter,
  Trade,
} from "@uniswap/v3-sdk";
import { FormikValues, FormikContextType, useFormikContext } from "formik";
import { useContext, useEffect } from "react";
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

const GasFeeEstimator = () => {
  const formik: FormikContextType<FormikValues> = useFormikContext();
  const { _provider, swapWidgetSettings } = useContext(appContext);

  const { gasInfo } = useGasContext();

  const { _address, _poolContract, _wallet } = useWalletContext();

  const { tokenA, tokenB, inputAmount, outputAmount, gas, locked, inputMode } =
    formik.values;

  useEffect(() => {
    if (!_poolContract || locked || utils.createDecimal(inputAmount) === null)
      return;

    (async () => {
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

      console.log("uncheckedTrade", uncheckedTrade);

      console.log("swapWidgetSettings", swapWidgetSettings);

      const deadline =
        (swapWidgetSettings && swapWidgetSettings.deadline) || 20;
      const slippage =
        (swapWidgetSettings && swapWidgetSettings.slippage) || 0.5; // Default slippage percentage

      // Convert percentage to basis points
      const slippageBips = Math.round(slippage * 100); // Convert to basis points

      // Ensure slippage is within the valid range of 0% (0 bips) to 50% (5000 bips)
      const validSlippageBips = Math.max(0, Math.min(5000, slippageBips));

      const options: SwapOptions = {
        slippageTolerance: new Percent(validSlippageBips, 10_000), // Basis points to Percent
        deadline: Math.floor(Date.now() / 1000) + 60 * deadline, // Deadline in seconds
        recipient: _address!,
      };


      const methodParameters = SwapRouter.swapCallParameters(
        [uncheckedTrade],
        options
      );

      const feeData = await _provider.getFeeData();
      const { maxFeePerGas, maxPriorityFeePerGas } = feeData;

      const tx = {
        data: methodParameters.calldata,
        to: SWAP_ROUTER_ADDRESS,
        value: methodParameters.value,
        // from: _address,
        maxFeePerGas: maxFeePerGas,
        maxPriorityFeePerGas: maxPriorityFeePerGas,
      };

      try {
        const gasUnits = await _wallet!.estimateGas(tx);

        console.log('gasUnits requierd GWEI', gasUnits);

        if (maxFeePerGas) {
          const _gas = await utils.calculateGasFee(
            gasUnits.toString(),
            maxFeePerGas.toString(),
            maxPriorityFeePerGas.toString()
          );

          // calculated gas..
          formik.setFieldValue("gas", _gas!.finalGasFee);
        }

        console.log('Tx', tx);

        formik.setFieldValue("tx", tx);
      } catch (error) {
        // console.error(error);
        formik.setFieldError("gas", "Need more ETH to pay for this swap");
      }
    })();
  }, [_poolContract, locked, inputAmount, outputAmount, inputMode, gasInfo]);

  return (
    <>
      {gas && (
        <div className="grid grid-cols-[1fr_auto] items-center mt-2">
          <div>
            <a
              href="https://eth-converter.com/"
              target="_blank"
              className="text-sm font-bold text-neutral-600 hover:text-neutral-700"
            >
              Convert to $ value
            </a>
          </div>
          <div className="grid grid-cols-[auto_auto_1fr] items-center">
            <span className="text-black dark:text-neutral-200">
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
              <span className="font-mono">{new Decimal(gas).toFixed(0)}</span>{" "}
              GWEI
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default GasFeeEstimator;
