import {
  FeeAmount,
  Pool,
  Route,
  SwapOptions,
  SwapRouter,
  Trade,
} from "@uniswap/v3-sdk";
import { useFormikContext } from "formik";
import { useContext, useEffect } from "react";
import getOutputQuote from "../libs/getOutputQuote";
import { appContext } from "../../../AppContext";
import { CurrencyAmount, Percent, TradeType } from "@uniswap/sdk-core";
import { fromReadableAmount } from "../../../utils/swap";
import * as utils from "../../../utils";

import JSBI from "jsbi";
import { useWalletContext } from "../../../providers/WalletProvider/WalletProvider";
import {
  MAX_FEE_PER_GAS,
  MAX_PRIORITY_FEE_PER_GAS,
  SWAP_ROUTER_ADDRESS,
} from "../../../providers/QuoteProvider/libs/constants";


const GasFeeEstimator = () => {
  const formik: any = useFormikContext();
  const { _provider } = useContext(appContext);
  const { _address, _poolContract, _wallet } = useWalletContext();

  const { isValid } = formik;
  const { tokenA, tokenB, inputAmount, gas, locked } = formik.values;
  useEffect(() => {
  
    if (!_poolContract || locked || utils.createDecimal(inputAmount) === null || !isValid) return;

    (async () => {
      const [liquidity, slot0] = await Promise.all([
        _poolContract.liquidity(),
        _poolContract.slot0(),
      ]);

      const pool = new Pool(
        tokenA,
        tokenB,
        FeeAmount.HIGH,
        slot0[0].toString(),
        liquidity.toString(),
        parseInt(slot0[1])
      );

      const swapRoute = new Route([pool], tokenA, tokenB);

      const quoteData = await getOutputQuote(
        tokenA,
        inputAmount,
        swapRoute,
        _provider
      );

      const uncheckedTrade = Trade.createUncheckedTrade({
        route: swapRoute,
        inputAmount: CurrencyAmount.fromRawAmount(
          tokenA,
          fromReadableAmount(inputAmount.toString(), tokenA.decimals).toString()
        ),
        outputAmount: CurrencyAmount.fromRawAmount(
          tokenB,
          JSBI.BigInt(quoteData)
        ),
        tradeType: TradeType.EXACT_INPUT,
      });

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

      const gasFee = await _provider.getFeeData();
      const gasUnits = await _wallet!.estimateGas(tx);
      const { maxFeePerGas, maxPriorityFeePerGas } = gasFee; // wei

      if (maxFeePerGas) {
        const _gas = await utils.calculateGasFee(
          gasUnits.toString(),
          maxFeePerGas.toString(),
          maxPriorityFeePerGas.toString()
        );

        // calculated gas..
        formik.setFieldValue("gas", _gas.finalGasFee);
      }

      formik.setFieldValue("tx", tx);
    })();
  }, [formik.values.inputAmount, _poolContract, locked]);

  return (
    <div className="grid grid-cols-[1fr_auto] items-center">
      <div>
        <a
          href="https://eth-converter.com/"
          target="_blank"
          className="text-sm"
        >
          Convert to $ value
        </a>
      </div>
      <div className="grid grid-cols-[auto_auto_1fr] items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="18"
          viewBox="0 0 24 24"
          strokeWidth="2.5"
          stroke="#a855f7"
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="#f9e79f"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M4 12c0 -1.657 1.592 -3 3.556 -3c1.963 0 3.11 1.5 4.444 3c1.333 1.5 2.48 3 4.444 3s3.556 -1.343 3.556 -3" />
        </svg>
        <p className="text-sm font-bold text-[#f9e79f]">
          <span className="font-mono">{Math.floor(gas).toString()}</span> GWEI
        </p>
      </div>
    </div>
  );
};

export default GasFeeEstimator;
