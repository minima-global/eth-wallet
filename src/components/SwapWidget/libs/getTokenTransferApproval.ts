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
    const transport = await TransportWebUSB.create();
    const ethApp = new Eth(transport);

    // Create the unsigned transaction for approval
    const unsignedTx = new Transaction();
    unsignedTx.to = tokenAddress;
    unsignedTx.value = BigInt(0);

    // Setting optional parameters if provided
    if (gasLimit) unsignedTx.gasLimit = gasLimit;
    if (gasPrice) unsignedTx.maxFeePerGas = parseUnits(gasPrice, "gwei");
    if (priorityFee) unsignedTx.maxPriorityFeePerGas = parseUnits(priorityFee, "gwei");

    // Encode the approval function data
    unsignedTx.data = new Interface([
      "function approve(address spender, uint256 amount)",
    ]).encodeFunctionData("approve", [spenderAddress, amountToApprove]);

    // Set the chain ID and nonce
    unsignedTx.chainId = BigInt(chainId);
    unsignedTx.nonce = nonce || await provider.getTransactionCount(current.address);

    // Serialize the unsigned transaction
    const serializedTx = unsignedTx.unsignedSerialized;

    // Resolve the transaction using Ledger's service
    const resolution = await ledgerService.resolveTransaction(
      serializedTx.slice(2),
      ethApp.loadConfig,
      { erc20: true, externalPlugins: true }
    );

    // Sign the transaction with Ledger
    const signature = await ethApp.signTransaction(
      bip44Path,
      serializedTx.slice(2),
      resolution
    );

    // Add the signature to the transaction
    unsignedTx.signature = {
      r: `0x${signature.r}`,
      s: `0x${signature.s}`,
      v: `0x${signature.v}`,
    };

    // Serialize the signed transaction
    const serializedSignedTx = Transaction.from(unsignedTx).serialized;

    // Broadcast the transaction
    const txResponse = await provider.broadcastTransaction(serializedSignedTx);

    // Return the transaction response
    return txResponse;
  } catch (error) {
    console.error("Error approving token with Ledger:", error);
    throw error;
  }
}