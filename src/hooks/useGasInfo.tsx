import { useContext, useEffect, useState } from "react";
import { appContext } from "../AppContext";
import { GasFeesApiResponse } from "../types/GasFeeInterface";

interface GasInfo {
  suggestedMaxPriorityFeePerGas: string;
  suggestedMaxFeePerGas: string;
  minWaitTimeEstimate: number;
  maxWaitTimeEstimate: number;
}

// gets the latest gas information
const useGasInfo = (step: number, level: "low" | "medium" | "high") => {
  const { _provider, userKeys } = useContext(appContext);
  const [gasInfo, setGas] = useState<GasInfo | null>(null);
  const [gasCard, setGasCard] = useState<GasFeesApiResponse | null>(null);

  useEffect(() => {
    const fetchGasInfo = async () => {
      try {
        const currentNetwork = await _provider.getNetwork();
        if (currentNetwork.name.includes("unknown")) {
          const gasFee = await _provider.getFeeData();
          /**
                * {
                    "suggestedMaxPriorityFeePerGas": "0.88529281",
                    "suggestedMaxFeePerGas": "4.30958664",
                    "minWaitTimeEstimate": 15000,
                    "maxWaitTimeEstimate": 45000
                }
             */

          return { ...gasFee };
        } else {
          const preAuth = btoa(userKeys.apiKey + ":" + userKeys.apiKeySecret);
          const gasApi = `https://gas.api.infura.io/networks/${currentNetwork.chainId}/suggestedGasFees`;

          const gasData = (await new Promise((resolve) => {
            (window as any).MDS.net.GETAUTH(gasApi, preAuth, (resp) => {
              const data = JSON.parse(resp.response);
              // Full Data
              setGasCard(data);
              // Current Level set
              resolve(data[level]);
            });
          })) as GasInfo;
          /**
                 * {
                    "suggestedMaxPriorityFeePerGas": "1.5",
                    "suggestedMaxFeePerGas": "1.500977238",
                    "minWaitTimeEstimate": 15000,
                    "maxWaitTimeEstimate": 45000
                }
            */
          return { ...gasData };
        }
      } catch (error) {
        console.error(error);
        return null;
      }
    };

    // Reset gas info
    setGas(null);

    // If provider is unavailable or step is less than 2, return
    if (!_provider || step < 2) return;

    const fetchGasData = async () => {
      try {
        const _gas = await fetchGasInfo(); // Adjust this call to include necessary parameters
        setGas(_gas!);
      } catch (error) {
        // error
        console.error("Failed to fetch Gas API", error);
      }
    };

    // Initial fetch
    fetchGasData();

    // Set up polling every 30 seconds
    const intervalId = setInterval(fetchGasData, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [_provider, step, level, userKeys]);

  return { gasInfo, setGas, gasCardData: gasCard, level };
};

export default useGasInfo;
