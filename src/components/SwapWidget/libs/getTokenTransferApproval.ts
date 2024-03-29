import { Token } from "@uniswap/sdk-core";
import {
  Contract,
  Signer,
  TransactionReceipt,
  parseUnits,
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
  address: string,
): Promise<TransactionReceipt> {
  if (!signer || !address) {
    throw Error("No Provider Found");
  }

  const tokenContract = new Contract(token.address, ERC20_ABI, signer);
  const toWei = parseUnits(amount, token.decimals);
  const transaction = await tokenContract.approve(
    SWAP_ROUTER_ADDRESS,
    toWei
  );

  return transaction.wait();
}

export async function resetApproval(
  token: Token,
  signer: Signer,
  address: string,
): Promise<TransactionReceipt> {
  if (!signer || !address) {
    throw Error("No Provider Found");
  }

  const tokenContract = new Contract(token.address, ERC20_ABI, signer);

  const transaction = await tokenContract.approve(
    SWAP_ROUTER_ADDRESS,
    0
  );

  return transaction.wait();
}


export async function estimateGasForApproval(
  token: Token,
  amount: string,
  signer: Signer,
  address: string
): Promise<string> {
  if (!signer || !address) {
    throw Error("No Provider Found");
  }

  const tokenContract = new Contract(token.address, ERC20_ABI, signer);

  const gasEstimation = await tokenContract.approve.estimateGas(
    SWAP_ROUTER_ADDRESS,
    amount
  );

  return gasEstimation.toString();
}
