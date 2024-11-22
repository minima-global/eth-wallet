import { useContext, useEffect, useState } from "react";
import { Pool, Route, FeeAmount } from "@uniswap/v3-sdk";
import { formatUnits } from "ethers";
import { useWalletContext } from "../providers/WalletProvider/WalletProvider";
import { appContext } from "../AppContext";
import getOutputQuote from "../components/SwapWidget/libs/getOutputQuote";

const READABLE_FORM_LEN = 20;

function toReadableAmount(rawAmount: number, decimals: number): string {
  return formatUnits(rawAmount, decimals).slice(0, READABLE_FORM_LEN);
}

export const useSwapQuote = (inputAmount, outputAmount, inputMode, tokenA, tokenB, locked, receipt) => {
  const { _provider } = useContext(appContext);
  const { _poolContract } = useWalletContext();
  const [quote, setQuote] = useState({ inputAmount, outputAmount });
  const [loading, setLoading] = useState(false);

  const fetchQuote = async () => {
    setLoading(true);


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
      tokenA,
      tokenB,
      FeeAmount.HIGH,
      poolInfo.sqrtPriceX96.toString(),
      poolInfo.liquidity.toString(),
      parseInt(poolInfo.tick)
    );

    const swapRoute = new Route([pool], tokenA, tokenB);

    const quoteData = await getOutputQuote(
      inputMode ? tokenA : tokenB,
      inputMode ? inputAmount : outputAmount,
      swapRoute,
      _provider
    );

    const newQuote = {
      inputAmount: inputMode ? inputAmount : toReadableAmount(quoteData[0], tokenA.decimals),
      outputAmount: inputMode ? toReadableAmount(quoteData[0], tokenB.decimals) : outputAmount,
    };

    setQuote(newQuote);
    setLoading(false);
  };

  useEffect(() => {
    if (!locked && receipt === null && _poolContract) {
      fetchQuote();
    }
  }, [inputAmount, outputAmount, inputMode, tokenA, tokenB, locked, receipt, _poolContract]);

  return { quote, loading };
};

export default useSwapQuote;