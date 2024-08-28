import React, { createContext, useContext, useEffect } from "react";
import { formatUnits } from "ethers";
import { FormikContextType, FormikValues, useFormikContext } from "formik";
import getOutputQuote from "../../components/SwapWidget/libs/getOutputQuote";
import { appContext } from "../../AppContext";
import { FeeAmount, Pool, Route } from "@uniswap/v3-sdk";
import Decimal from "decimal.js";
import { useWalletContext } from "../WalletProvider/WalletProvider";
import createDecimal from "../../utils/createDecimal";

const READABLE_FORM_LEN = 20;

function toReadableAmount(rawAmount: number, decimals: number): string {
  return formatUnits(rawAmount, decimals).slice(0, READABLE_FORM_LEN);
}

type Props = {
  children: React.ReactNode;
};

const QuoteContext = createContext<any | null>(null);

export const QuoteContextProvider = ({ children }: Props) => {
  const { _provider } = useContext(appContext);

  const { _poolContract } = useWalletContext();

  const formik: FormikContextType<FormikValues> = useFormikContext();
  const { values, setFieldValue, isSubmitting } = formik;
  const { tokenA, tokenB,  inputMode } = values;

  const widgetNotReady =
    // createDecimal(inputAmount) === null ||
    // new Decimal(inputAmount).lte(0) ||
    !_poolContract;

  useEffect(() => {
    if (widgetNotReady) return;

    const fetchData = async () => {
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
        tokenA,
        tokenB,
        FeeAmount.HIGH,
        poolInfo.sqrtPriceX96.toString(),
        poolInfo.liquidity.toString(),
        parseInt(poolInfo.tick)
      );

      const swapRoute = new Route([pool], tokenA, tokenB);

      const quoteData = await getOutputQuote(
        inputMode ? tokenA:tokenB,
        inputMode ? values.inputAmount : values.outputAmount,
        swapRoute,
        _provider
      );

      setFieldValue(
        inputMode ? "outputAmount":"inputAmount",
        toReadableAmount(quoteData[0], inputMode?tokenB.decimals:tokenA.decimals)
      );
    };

    const requiresNewQuote = !isSubmitting && !values.locked && values.receipt === null;

    // Initial fetch
    if (requiresNewQuote) {
      fetchData();
    }

    // Set up interval to fetch data every 10 seconds
    const intervalId = setInterval(() => {

      if (requiresNewQuote) {        
        fetchData();
      }
    }, 10000);

    // Clean up interval on unmount or when dependencies change
    return () => clearInterval(intervalId);
  }, [
    isSubmitting,
    values.locked,
    values.receipt,
    widgetNotReady,
    values.inputAmount,
    values.outputAmount,
    values.input,
    values.output,
    _provider,
    _poolContract,
    tokenA,
    tokenB,
    inputMode,
    setFieldValue,
  ]);

  return (
    <QuoteContext.Provider
      value={
        {
          // todo
        }
      }
    >
      {children}
    </QuoteContext.Provider>
  );
};

export const useQuoteProvider = () => {
  const context = useContext(QuoteContext);

  if (!context)
    throw new Error(
      "QuoteContext must be called from within the QuoteContextProvider"
    );

  return context;
};
