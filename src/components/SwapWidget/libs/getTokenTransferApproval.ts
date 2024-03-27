import { Token } from "@uniswap/sdk-core";
import {
  Contract,
  JsonRpcProvider,
  MaxUint256,
  Signer,
  TransactionRequest,
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
  provider: JsonRpcProvider,
  address: string
): Promise<TransactionState> {
  if (!signer || !address) {
    console.log("No Provider Found");
    return TransactionState.Failed;
  }

  try {
    console.log('allowance for', token.address);
    const tokenContract = new Contract(token.address, ERC20_ABI, signer);

    const transaction = await tokenContract.approve(
      SWAP_ROUTER_ADDRESS,
      amount
    );

    return sendTransactionViaWallet(
      {
        ...transaction,
        from: address,
      },
      signer,
      provider
    );
  } catch (e) {
    console.error(e);
    return TransactionState.Failed;
  }
}

async function sendTransactionViaWallet(
  transaction: TransactionRequest,
  wallet: Signer,
  provider: JsonRpcProvider
): Promise<TransactionState> {
  const txRes = await wallet.sendTransaction(transaction);

  let receipt: any = null;

  if (!wallet) {
    return TransactionState.Failed;
  }

  while (receipt === null) {
    try {
      receipt = await provider.getTransactionReceipt(txRes.hash);

      if (receipt === null) {
        continue;
      }
    } catch (e) {
      console.log(`Receipt error:`, e);
      break;
    }
  }

  // Transaction was successful if status === 1
  if (receipt) {
    return TransactionState.Sent;
  } else {
    return TransactionState.Failed;
  }
}
