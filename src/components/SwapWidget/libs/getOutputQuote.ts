import { Currency, CurrencyAmount, Token, TradeType } from "@uniswap/sdk-core";
import { Route, SwapQuoter } from "@uniswap/v3-sdk";
import { fromReadableAmount } from "../../../utils/swap";
import { JsonRpcProvider, AbiCoder } from "ethers";
import { QUOTER_CONTRACT_ADDRESS } from "../../../constants";

async function getOutputQuote(
  tokenIn: Token,
  amountIn: number,
  route: Route<Currency, Currency>,
  provider: JsonRpcProvider
) {
  if (!provider) {
    throw new Error("Provider required to get pool state");
  }

  const { calldata } = await SwapQuoter.quoteCallParameters(
    route,
    CurrencyAmount.fromRawAmount(
      tokenIn,
      fromReadableAmount(amountIn, tokenIn.decimals).toString()
    ),
    TradeType.EXACT_INPUT,
    {
      useQuoterV2: true,
    }
  );


  const quoteCallReturnData = await provider.call({
    to: QUOTER_CONTRACT_ADDRESS,
    data: calldata,
  });

  const abiCoder = new AbiCoder();
  return abiCoder.decode(["uint256"], quoteCallReturnData);
}

export default getOutputQuote;