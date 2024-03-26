import React, { createContext, useContext, useEffect } from "react";

import Quoter from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";

import { Contract, formatUnits, parseUnits } from "ethers";
import {
  QUOTER_CONTRACT_ADDRESS,
} from "../../constants";
import { useWalletContext } from "../WalletProvider/WalletProvider";
import { useFormikContext } from "formik";
import { SUPPORTED_CHAINS, Token } from "@uniswap/sdk-core";

const READABLE_FORM_LEN = 20;

function fromReadableAmount(amount: number, decimals: number) {
  return parseUnits(amount.toString(), decimals);
}

function toReadableAmount(rawAmount: number, decimals: number): string {
  return formatUnits(rawAmount, decimals).slice(0, READABLE_FORM_LEN);
}

type Props = {
  children: React.ReactNode;
};

const QuoteContext = createContext<any | null>(null);

export const QuoteContextProvider = ({ children }: Props) => {
  const { _wallet: signer } = useWalletContext();
  const { values, setFieldValue }: any = useFormikContext();

  const quoterContract = new Contract(
    QUOTER_CONTRACT_ADDRESS,
    Quoter.abi,
    signer
  );

  useEffect(() => {
    const _tokenA = new Token(SUPPORTED_CHAINS['1'], values.input.address, values.input.decimals, values.input.symbol, values.input.name);
    const _tokenB = new Token(SUPPORTED_CHAINS['1'], values.output.address, values.output.decimals, values.output.symbol, values.output.name);
  
    console.log('token A', _tokenA);
    console.log('token B', _tokenB);

    if (values.inputAmount === 0) return;
    
    (async () => {
      async function getPoolConstants(): Promise<{
        token0: string;
        token1: string;
        fee: number;
      }> {
        // const currentPoolAddress = computePoolAddress({
        //   factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
        //   tokenA: _tokenA,
        //   tokenB: _tokenB,
        //   fee: FeeAmount.HIGH,
        // });
        // No need to compute since we only use 1 pool...
        const currentPoolAddress = "0x8E427a754b13Fa1A165Db583120daf7c3aBe4019";

        console.log(currentPoolAddress);
    
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

      const poolConstants = await getPoolConstants();

      
      try {
        const wMinima = poolConstants.token0;
        
        let quotedAmountOut;
        // Check what the input asset is and then swap quote accordingly
        if (_tokenA.address === wMinima) {
          quotedAmountOut = await quoterContract.quoteExactInputSingle.staticCall(
            poolConstants.token0,
            poolConstants.token1,
            poolConstants.fee,
            fromReadableAmount(
              values.inputAmount,
              values.input.decimals
            ).toString(),
            0
          );
        } else {
          quotedAmountOut = await quoterContract.quoteExactInputSingle.staticCall(
            poolConstants.token1,
            poolConstants.token0,
            poolConstants.fee,
            fromReadableAmount(
              values.inputAmount,
              values.input.decimals
            ).toString(),
            0
          );
        }

        setFieldValue("outputAmount", toReadableAmount(
          quotedAmountOut,
          values.output.decimals
        ));        

        
        return toReadableAmount(
          quotedAmountOut,
          values.output.decimals
        );
      } catch (error) {
        console.error(error);
      }
    })();
  }, [values.inputAmount, values.input, values.output]);

  

  return <QuoteContext.Provider value={{ 

    // todo

  }}>{children}</QuoteContext.Provider>;
};

export const useQuoteProvider = () => {
  const context = useContext(QuoteContext);

  if (!context)
    throw new Error(
      "WalletContext must be called from within the WalletContextProvider"
    );

  return context;
};
