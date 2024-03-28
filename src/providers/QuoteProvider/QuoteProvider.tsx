import React, { createContext, useContext, useEffect } from "react";
import { formatUnits } from "ethers";
import { useFormikContext } from "formik";
import getOutputQuote from "../../components/SwapWidget/libs/getOutputQuote";
import { appContext } from "../../AppContext";
import usePoolInfo from "../../hooks/usePoolInfo";
import { FeeAmount, Pool, Route } from "@uniswap/v3-sdk";
import Decimal from "decimal.js";
import { useWalletContext } from "../WalletProvider/WalletProvider";

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

  const formik: any = useFormikContext();
  const { tokenA, tokenB } = formik.values;

  const { values, setFieldValue }: any = useFormikContext();

  useEffect(() => {
    if (
      !Number(values.inputAmount) ||
      new Decimal(values.inputAmount).lte(0) ||
      !_poolContract
    )
      return;

    (async () => {
      const [fee, tickSpacing, liquidity, slot0] =
      await Promise.all([
        _poolContract.fee(),
        _poolContract.tickSpacing(),
        _poolContract.liquidity(),
        _poolContract.slot0(),
      ])

      const poolInfo = {
        fee,
        tickSpacing,
        liquidity,
        sqrtPriceX96: slot0[0],
        tick: slot0[1],
      }

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
        tokenA,
        values.inputAmount,
        swapRoute,
        _provider
      );

      setFieldValue(
        "outputAmount",
        toReadableAmount(quoteData[0], tokenB.decimals)
      );
    })();
  }, [
    values.inputAmount,
    values.input,
    values.output,
    _provider,
    _poolContract,
    tokenA,
    tokenB,
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
