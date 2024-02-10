import { useMemo, useState } from "react";
import { parseEther } from "ethers";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";

interface IProps {
  recipientAddress: string;
  value: string;
}
function GasEstimation({ recipientAddress, value }: IProps) {
  const [gasEstimate, setGasEstimate] = useState("");
  const { _wallet } = useWalletContext();

  useMemo(() => {
    async function estimateGas() {
      try {
        // Create a transaction object (this can be tailored according to your specific transaction)
        const tx = {
          to: recipientAddress,
          value: parseEther(value), // Sending 0.1 ETH (replace with your desired amount)
        };
        console.log("estimating gas", tx);
        // Estimate gas required for the transaction
        const gasLimit = await _wallet!.estimateGas(tx);
        console.log("gasLimit", gasLimit.toString());
        setGasEstimate(gasLimit!.toString());
      } catch (error) {
        console.error("Error estimating gas:", error);
      }
    }

    estimateGas();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mx-4">
        <h3 className="font-bold">Gas Fee</h3>
        <p>{gasEstimate}</p>
      </div>
    </div>
  );
}

export default GasEstimation;
