import React, { createContext, useContext, useEffect } from "react";
import { formatUnits } from "ethers";
import { useFormikContext } from "formik";
import { SUPPORTED_CHAINS, Token } from "@uniswap/sdk-core";
import getOutputQuote from "../../components/SwapWidget/libs/getOutputQuote";
import { appContext } from "../../AppContext";
import usePoolInfo from "../../hooks/usePoolInfo";
import { FeeAmount, Pool, Route } from "@uniswap/v3-sdk";

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
  const poolInfo = usePoolInfo();

  const { values, setFieldValue }: any = useFormikContext();

  useEffect(() => {
    const _tokenA = new Token(
      SUPPORTED_CHAINS["1"],
      values.input.address,
      values.input.decimals,
      values.input.symbol,
      values.input.name
    );
    const _tokenB = new Token(
      SUPPORTED_CHAINS["1"],
      values.output.address,
      values.output.decimals,
      values.output.symbol,
      values.output.name
    );

    if (values.inputAmount === 0) return;

    (async () => {
      // Create a new Pool Instance..
      const pool = new Pool(
        _tokenA,
        _tokenB,
        FeeAmount.HIGH,
        poolInfo.sqrtPriceX96.toString(),
        poolInfo.liquidity.toString(),
        parseInt(poolInfo.tick)
      );

      const swapRoute = new Route([pool], _tokenA, _tokenB);


      const quoteData = await getOutputQuote(
        _tokenA,
        values.inputAmount,
        swapRoute,
        _provider
      );

      setFieldValue(
        "outputAmount",
        toReadableAmount(quoteData[0], _tokenB.decimals)
      );
    })();
  }, [
    values.inputAmount,
    values.input,
    values.output,
    _provider,
    poolInfo,
    setFieldValue,
  ]);

  return (
    <QuoteContext.Provider
      value={{
        // todo
      }}
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
