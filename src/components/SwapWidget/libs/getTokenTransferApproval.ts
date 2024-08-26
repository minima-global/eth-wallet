import { Token } from "@uniswap/sdk-core";
import {
  Contract,
  Interface,
  MaxUint256,
  Signer,
  Transaction,
  TransactionReceipt,
  parseUnits,
} from "ethers";
import {
  ERC20_ABI,
  SWAP_ROUTER_ADDRESS,
} from "../../../providers/QuoteProvider/libs/constants";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import Eth, { ledgerService } from "@ledgerhq/hw-app-eth";

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

  let toWei = parseUnits(amount, token.decimals);
  if (amount === MaxUint256.toString()) {
    toWei = MaxUint256;
  }
  const transaction = await tokenContract.approve(SWAP_ROUTER_ADDRESS, toWei);

  return transaction.wait();
}

export async function resetApproval(
  token: Token,
  signer: Signer,
  address: string
): Promise<TransactionReceipt> {
  if (!signer || !address) {
    throw Error("No Provider Found");
  }

  const tokenContract = new Contract(token.address, ERC20_ABI, signer);

  const transaction = await tokenContract.approve(SWAP_ROUTER_ADDRESS, 0);

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

// Reusable function to approve tokens using Ledger
export async function approveTokenWithLedger({
  current,
  tokenAddress,
  spenderAddress,
  amountToApprove = MaxUint256.toString(), // Default to max approval
  chainId,
  gasLimit,
  gasPrice,
  priorityFee,
  nonce,
  bip44Path,
  provider,
}) {
  try {
    // Establish connection with Ledger
    let transport;

    // Attempt to initialize the TransportWebUSB connection
    try {
      transport = await TransportWebUSB.create();
    } catch (err) {
      console.error("Failed to initialize TransportWebUSB:", err);
      throw new Error("Please ensure Ledger is connected and unlocked.");
    }
    const ethApp = new Eth(transport);

    // Create the unsigned transaction for approval
    const tx: any = {
      to: tokenAddress,
      value: 0,
      data: new Interface([
        "function approve(address spender, uint256 amount)",
      ]).encodeFunctionData("approve", [spenderAddress, amountToApprove]),
      chainId: Number(chainId),
      nonce: nonce || await provider.getTransactionCount(current.address),
    };

    // Estimate gas before signing
    const estimatedGas = await provider.estimateGas({...tx, from: current.address});
    tx.gasLimit = gasLimit || estimatedGas;

    if (gasPrice) tx.maxFeePerGas = parseUnits(gasPrice, "gwei");
    if (priorityFee) tx.maxPriorityFeePerGas = parseUnits(priorityFee, "gwei");

    // Serialize the unsigned transaction
    const serializedTx = Transaction.from(tx).unsignedSerialized;

    // Resolve and sign the transaction
    const resolution = await ledgerService.resolveTransaction(
      serializedTx.slice(2),
      ethApp.loadConfig,
      { erc20: true, externalPlugins: true }
    );
    
    const signature = await ethApp.signTransaction(
      bip44Path,
      serializedTx.slice(2),
      resolution
    );
    
    // Construct the signed transaction
    const signedTx = Transaction.from({
      ...tx,
      signature: {
        r: `0x${signature.r}`,
        s: `0x${signature.s}`,
        v: parseInt(signature.v, 16),
      },
    });

    console.log(signedTx);
    // Broadcast the transaction
    const txResponse = await provider.broadcastTransaction(signedTx.serialized);

    return txResponse;
  } catch (error: any) {
    if (error.error && typeof error.error === 'object' && error.error.code === -32000 && error.error.message === "already known") {      
      // You might want to implement a way to track this transaction
      // or inform the user that the transaction is already pending
      throw Error("Transaction already submitted. Waiting for confirmation...");
    } else {
      console.error("Error approving token with Ledger:", error);
      throw error;
    }
  }
}