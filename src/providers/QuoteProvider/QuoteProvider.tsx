import React, { createContext, useContext, useEffect, useState } from "react";

import Quoter from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";

import { computePoolAddress } from "@uniswap/v3-sdk";

import { Contract, JsonRpcProvider, formatUnits, parseUnits } from "ethers";
import {
  POOL_FACTORY_CONTRACT_ADDRESS,
  QUOTER_CONTRACT_ADDRESS,
} from "../../constants";
import { CurrentConfig } from "./config";
import { useWalletContext } from "../WalletProvider/WalletProvider";

const READABLE_FORM_LEN = 4;

export function fromReadableAmount(amount: number, decimals: number) {
  return parseUnits(amount.toString(), decimals);
}

export function toReadableAmount(rawAmount: number, decimals: number): string {
  return formatUnits(rawAmount, decimals).slice(0, READABLE_FORM_LEN);
}

type Props = {
  children: React.ReactNode;
};
//   type Context = {

//   };

const QuoteContext = createContext<any | null>(null);

export const QuoteContextProvider = ({ children }: Props) => {
  const { _wallet: signer } = useWalletContext();

  const [outputAmount, setOutputAmount] = useState<any>();

  const quoterContract = new Contract(
    QUOTER_CONTRACT_ADDRESS,
    Quoter.abi,
    signer
  );

  useEffect(() => {
    (async () => {
      const poolConstants = await getPoolConstants();

      try {
        const quotedAmountOut = await quoterContract.quoteExactInputSingle.staticCall(
          poolConstants.token0,
          poolConstants.token1,
          poolConstants.fee,
          fromReadableAmount(
            CurrentConfig.tokens.amountIn,
            CurrentConfig.tokens.in.decimals
          ).toString(),
          0
        );

        console.log(
          toReadableAmount(quotedAmountOut, CurrentConfig.tokens.out.decimals)
        );

        setOutputAmount(toReadableAmount(
            quotedAmountOut,
            CurrentConfig.tokens.out.decimals
          ));
        return toReadableAmount(
          quotedAmountOut,
          CurrentConfig.tokens.out.decimals
        );
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  async function getPoolConstants(): Promise<{
    token0: string;
    token1: string;
    fee: number;
  }> {
    const currentPoolAddress = computePoolAddress({
      factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
      tokenA: CurrentConfig.tokens.in,
      tokenB: CurrentConfig.tokens.out,
      fee: CurrentConfig.tokens.poolFee,
    });

    const poolContract = new Contract(
      currentPoolAddress,
      IUniswapV3PoolABI.abi,
      signer
    );
    const [token0, token1, fee] = await Promise.all([
      poolContract.token0(),
      poolContract.token1(),
      poolContract.fee(),
    ]);

    console.log(token0, token1, fee);

    return {
      token0,
      token1,
      fee,
    };
  }

  return <QuoteContext.Provider value={{outputAmount}}>{children}</QuoteContext.Provider>;
};

export const useQuoteProvider = () => {
  const context = useContext(QuoteContext);

  if (!context)
    throw new Error(
      "WalletContext must be called from within the WalletContextProvider"
    );

  return context;
};
