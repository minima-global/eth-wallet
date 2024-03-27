import { Token } from "@uniswap/sdk-core";
import {
  Contract,
  Signer,
  TransactionReceipt,
} from "ethers";
import {
  ERC20_ABI,
  SWAP_ROUTER_ADDRESS,
} from "../../../providers/QuoteProvider/libs/constants";

export enum TransactionState {
  Failed = "Failed",
  New = "New",
  Rejected = "Rejected",
  Sending = "Sending",
  Sent = "Sent",
}
export async function getTokenTransferApproval(
  token: Token,
  amount: string,
  signer: Signer,
  address: string
): Promise<TransactionReceipt> {
  if (!signer || !address) {
    throw Error("No Provider Found");
  }

  const tokenContract = new Contract(token.address, ERC20_ABI, signer);

  const transaction = await tokenContract.approve(
    SWAP_ROUTER_ADDRESS,
    amount
  );

  return transaction.wait();
}
