import { useEffect, useState } from "react";
import { formatEther, parseEther } from "ethers";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";
import ConversionRateUSD from "../ConversionRateUSD";

interface IProps {
  recipientAddress: string;
  value: string;
  asset: string;
}
function GasEstimation({ recipientAddress, value, asset }: IProps) {
  const [loading, setLoading] = useState(false);

  const [gasEstimate, setGasEstimate] = useState("");
  const [total, setTotal] = useState("");
  const { _wallet, _minimaContract } = useWalletContext();

  async function estimateGasMinimaTransaction() {
    setLoading(true);

    try {
      const gasLimit = await _minimaContract!.transfer.estimateGas(
        recipientAddress,
        value
      );
      // convert gas to ether val, then add ether value
      const transactionTotal = gasLimit + parseEther(value);
      console.log("TransactionTotal: " + transactionTotal);
      // set the string representation of the gas
      setGasEstimate(gasLimit.toString());
      // set the string representation of the total
      setTotal(transactionTotal.toString());

      setTimeout(() => {
        setLoading(false);
      }, 5000);
    } catch (error) {
      console.error("Error estimating gas:", error);
      setLoading(false);
    }
  }

  async function estimateGas() {
    setLoading(true);
    try {
      // Create a transaction object (this can be tailored according to your specific transaction)
      const tx = {
        to: recipientAddress,
        value: parseEther(value), // Sending 0.1 ETH (replace with your desired amount)
      };
      // Estimate gas required for the transaction
      const gasLimit = await _wallet!.estimateGas(tx); // wei
      // convert gas to ether val, then add ether value
      const transactionTotal = gasLimit + parseEther(value);
      console.log("TransactionTotal: " + transactionTotal);
      // set the string representation of the gas
      setGasEstimate(gasLimit.toString());
      // set the string representation of the total
      setTotal(transactionTotal.toString());

      setTimeout(() => {
        setLoading(false);
      }, 5000);
    } catch (error) {
      console.error("Error estimating gas:", error);
      setLoading(false);
    }
  }
  useEffect(() => {
    // Call your function initially
    if (asset === "minima") {
      estimateGasMinimaTransaction();
    }

    if (asset === "ether") {
      estimateGas();
    }

    // Set up an interval to call your function every 15 seconds
    const intervalId = setInterval(estimateGas, 15000);

    // Cleanup function to clear the interval when the component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, [asset]);

  return (
    <div>
      <div
        className={`flex justify-between items-center mx-4 ${
          loading ? "animate-pulse temporary-pulse" : ""
        }`}
      >
        <h3 className="font-bold">Gas Fee</h3>
        <p>{formatEther(BigInt(gasEstimate))}</p>
      </div>
      <div
        className={`flex justify-between items-center mx-4 ${
          loading ? "animate-pulse temporary-pulse" : ""
        }`}
      >
        <h3 className="font-bold">Total</h3>
        <div>
          <p>{total && total.length ? formatEther(total) : "N/A"}</p>
          <div className="text-right text-teal-500">
            <ConversionRateUSD
              amount={total ? formatEther(total) : "0"}
              asset="ether"
            />
          </div>
        </div>
      </div>
      {loading && (
        <div className="mx-4 flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="animate-spin text-teal-500"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="#7f5345"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M10 20.777a8.942 8.942 0 0 1 -2.48 -.969" />
            <path d="M14 3.223a9.003 9.003 0 0 1 0 17.554" />
            <path d="M4.579 17.093a8.961 8.961 0 0 1 -1.227 -2.592" />
            <path d="M3.124 10.5c.16 -.95 .468 -1.85 .9 -2.675l.169 -.305" />
            <path d="M6.907 4.579a8.954 8.954 0 0 1 3.093 -1.356" />
            <path d="M12 9l-2 3h4l-2 3" />
          </svg>
          <p className="text-sm">Calculating new fee...</p>
        </div>
      )}
    </div>
  );
}

export default GasEstimation;
