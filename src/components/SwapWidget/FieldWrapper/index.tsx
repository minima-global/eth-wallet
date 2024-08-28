import Decimal from "decimal.js";
import { formatUnits } from "ethers";
import { FormikContextType, FormikValues, useFormikContext } from "formik";
import { useContext, useEffect, useState, useCallback } from "react";
import { useWalletContext } from "../../../providers/WalletProvider/WalletProvider";
import { FeeAmount, Pool, Route } from "@uniswap/v3-sdk";
import getOutputQuote from "../libs/getOutputQuote";
import { toReadableAmount } from "../../../utils/swap";
import { appContext } from "../../../AppContext";

interface Props {
  type: "input" | "output";
  disabled: boolean;
  handleBlur: any;  
  extraClass?: string;
  inputRef?: any;
  buttonRef?: any;
  onFocus: () => void;
  currency: any;
}

import { debounce } from "lodash";
import { createDecimal } from "../../../utils";


const FieldWrapper = ({
  handleBlur,
  disabled,
  extraClass,
  type,
  inputRef,
  onFocus,
  currency
}: Props) => {
  const [f, setF] = useState(false);
  const formik: FormikContextType<FormikValues> = useFormikContext();
  const { tokenA, tokenB, inputMode, outputAmount, inputAmount } = formik.values;

  const { _provider } = useContext(appContext);
  const { _poolContract } = useWalletContext();

  // Debounced version of the fetch function
  const fetchQuoteDebounced = useCallback(
    debounce(async () => {
      if (!_poolContract) return;

      const [fee, tickSpacing, liquidity, slot0] = await Promise.all([
        _poolContract.fee(),
        _poolContract.tickSpacing(),
        _poolContract.liquidity(),
        _poolContract.slot0(),
      ]);

      const poolInfo = {
        fee,
        tickSpacing,
        liquidity,
        sqrtPriceX96: slot0[0],
        tick: slot0[1],
      };
      const pool = new Pool(
        // maintain the same token order...
        inputMode ? tokenA.token : tokenB.token,
        inputMode ? tokenB.token : tokenA.token,
        FeeAmount.HIGH,
        poolInfo.sqrtPriceX96.toString(),
        poolInfo.liquidity.toString(),
        parseInt(poolInfo.tick)
      );

      const swapRoute = new Route([pool], inputMode ? tokenA.token : tokenB.token, inputMode ? tokenB.token : tokenA.token);
      
      const quoteData = await getOutputQuote(
        inputMode ? tokenA.token : tokenB.token,
        inputMode ? inputAmount : outputAmount,
        swapRoute,
        _provider
      );
      
      formik.setFieldValue(
        inputMode ? "outputAmount":"inputAmount",
        toReadableAmount(quoteData[0], inputMode ? tokenB.token.decimals : tokenA.token.decimals)
      );

      
    }, 1000), // 1000ms debounce delay
    [_poolContract, tokenA, tokenB, inputMode, inputAmount, outputAmount, _provider]
  );

  // Effect to call debounced function whenever inputValue changes
  useEffect(() => {
    if ((inputAmount && inputAmount.length) || (outputAmount && outputAmount.length)) {
      fetchQuoteDebounced(); // Trigger the debounced function
    }

    // Cleanup function to cancel debounce if component unmounts or value changes
    return () => {
      fetchQuoteDebounced.cancel();
    };
  }, [inputAmount, fetchQuoteDebounced]);

  return (
    <div
      className={`${disabled ? "opacity-30" : ""} ${
        extraClass && extraClass
      } rounded pb-0 justify-between grid grid-cols-[2fr_0.5fr] `}
    >
      <div className="p-4">
        <label className="block text-sm text-gray-500 font-bold">
          {type === "input" ? "Sell" : "Buy"}
        </label>
        <input
          disabled={disabled}
          ref={inputRef}
          {...formik.getFieldProps(
            type === "input" ? "inputAmount" : "outputAmount"
          )}
          onBlur={(e) => {
            handleBlur(e);
            setF(false);
          }}
          onFocus={() => {
            setF(true);
            onFocus();
          }}
          placeholder="0"
          className={`${f && "underline"} w-full max-w text-2xl truncate bg-transparent font-mono focus:border-none focus:outline-none placeholder:text-neutral-500 font-bold`}
        />
      </div>
      <div className={`grid my-auto mr-3 text-center`}>
        <div className="font-bold">{currency.token.symbol}</div>
        <p className="max-w-[10ch] truncate font-bold tracking-widest text-center dark:text-neutral-500">
          {currency.balance
            ? new Decimal(formatUnits(currency.balance, currency.token.decimals).toString()).toString()
            : '-'}
        </p>
        {type === "output" && <div className="my-1" />}
        {type === "input" && createDecimal(formik.values.inputAmount) !== null && currency.balance && !(currency.balance && formik.values.inputAmount.length && new Decimal(formatUnits(currency.balance, currency.token.decimals)).equals(formik.values.inputAmount)) && (
          <button
            type="button"
            onClick={() =>
              formik.setFieldValue(
                "inputAmount",
                formatUnits(currency.balance, currency.token.decimals).toString()
              )
            }
            className="!outline-none p-0 m-0 tracking-wide transition-all hover:text-black dark:text-neutral-400 dark:hover:text-teal-500 font-bold"
          >
            MAX
          </button>          
        )}
      </div>
    </div>
  );
};

export default FieldWrapper;
