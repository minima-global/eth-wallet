import { TransactionReceipt as TxReceipt, formatEther, formatUnits } from "ethers";
import AddressBookContact from "../AddressBookContact";
import { useEffect, useState } from "react";
import { TransactionResponse } from "ethers";
import * as utils from "../../utils";
import Decimal from "decimal.js";

interface IProps {
  receipt: TxReceipt;
}
const TransactionReceiptCard = ({ receipt }: IProps) => {
  const [tx, setTx] = useState<TransactionResponse | null>(null);
  const [blockExplorer, setBlockExplorer] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      // set BlockExplorer link according to network.. keep null if not known
      const network = await receipt.provider.getNetwork();
      if (network.name === "mainnet") {
        setBlockExplorer("https://etherscan.io/tx/");
      } else if (network.name === "ropsten") {
        setBlockExplorer("https://ropsten.etherscan.io/tx/");
      } else if (network.name === "rinkeby") {
        setBlockExplorer("https://rinkeby.etherscan.io/tx/");
      } else if (network.name === "goerli") {
        setBlockExplorer("https://goerli.etherscan.io/tx/");
      } else if (network.name === "kovan") {
        setBlockExplorer("https://kovan.etherscan.io/tx/");
      } else {
        setBlockExplorer(null);
      }

      const _tx = await receipt?.getTransaction();
      setTx(_tx!);
    })();
  }, []);

  const handleCopy = () => {
    setCopied(true);
    utils.copyToClipboard(receipt.hash);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  if (!tx) {
    return (
      <div className="mx-4">
        <p className="text-sm">Loading transaction...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between px-4">
        <h3>Status</h3>
        {blockExplorer && (
          <a href={`${blockExplorer}${receipt.hash}`}>View on block explorer</a>
        )}
        {!blockExplorer && (
          <p className="dark:text-orange-500">N/A</p>
        )}
      </div>
      <div className="flex justify-between px-4">
        <h3></h3>
        <button className={`text-white p-0 focus:ring-transparent focus:outline-none focus:border-none ${copied ? 'animate-pulse text-teal-300' : ''}`} onClick={handleCopy}>
          {copied? "Copied!" : "Copy transaction ID"}
        </button>
      </div>
      <div className="flex justify-between px-4 mb-1 mt-3">
        <h3 className="font-bold">From</h3>
        <p className="font-bold">To</p>
      </div>
      <div className="mb-1 bg-teal-500 px-4 flex items-center justify-between break-all">
        <AddressBookContact address={receipt.from} />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="34"
          height="34"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="#7f5345"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path
            d="M12.089 3.634a2 2 0 0 0 -1.089 1.78l-.001 2.585l-1.999 .001a1 1 0 0 0 -1 1v6l.007 .117a1 1 0 0 0 .993 .883l1.999 -.001l.001 2.587a2 2 0 0 0 3.414 1.414l6.586 -6.586a2 2 0 0 0 0 -2.828l-6.586 -6.586a2 2 0 0 0 -2.18 -.434l-.145 .068z"
            strokeWidth="0"
            fill="currentColor"
          />
          <path
            d="M3 8a1 1 0 0 1 .993 .883l.007 .117v6a1 1 0 0 1 -1.993 .117l-.007 -.117v-6a1 1 0 0 1 1 -1z"
            strokeWidth="0"
            fill="currentColor"
          />
          <path
            d="M6 8a1 1 0 0 1 .993 .883l.007 .117v6a1 1 0 0 1 -1.993 .117l-.007 -.117v-6a1 1 0 0 1 1 -1z"
            strokeWidth="0"
            fill="currentColor"
          />
        </svg>
        <AddressBookContact contact address={receipt.to!} />
      </div>
      <div>        
        <ul className="py-6">
          <li className="flex justify-between px-4">
            <h3>Nonce</h3>
            <p className="">{tx.nonce}</p>
          </li>
          <li className="flex justify-between px-4">
            <h3>Amount</h3>
            <p className="font-bold">{formatEther(tx.value.toString())}</p>
          </li>
          <li className="flex justify-between px-4">
            <h3>Gas Units</h3>
            <p>{receipt.gasUsed.toString()}</p>
          </li>
          <li className="flex justify-between px-4">
            <h3>Gas Used</h3>
            <p>{formatEther(receipt.fee)}</p>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TransactionReceiptCard;
