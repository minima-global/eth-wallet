import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { useWalletContext } from "../WalletProvider/WalletProvider";
import { GasFeesApiResponse } from "../../types/GasFeeInterface";
import { parseEther } from "ethers";
import { useTokenStoreContext } from "../TokenStoreProvider";
import { appContext } from "../../AppContext";

/**
 * @EIP1559
 * Calculating gas fee as with EIP1559,
 * (BASE FEE + PRIORITY FEE) X UNITS OF GAS USED
 */

interface GasInfo {
  suggestedMaxPriorityFeePerGas: string;
  suggestedMaxFeePerGas: string;
  minWaitTimeEstimate: number;
  maxWaitTimeEstimate: number;
}
type Props = {
  children: React.ReactNode;
};
type Context = {
  loading: boolean;
  gasInfo: GasInfo | null;
  gasCardData: GasFeesApiResponse | null;
  level: "low" | "medium" | "high";
  estimateGas: (
    amount: string,
    address: string,
    asset: any
  ) => Promise<string | null>;
  clearGas: () => void;
  setLevel: React.Dispatch<React.SetStateAction<"low" | "medium" | "high">>;
  showGasCards: boolean;
  promptGasCards: () => void;
  startFetchingGasInfo: () => void;
  stopFetchingGasInfo: () => void;
};

const GasContext = createContext<Context | null>(null);

export const GasContextProvider = ({ children }: Props) => {
  const [loading, setLoading] = useState(false);
  const [gasInfo, setGasInfo] = useState<GasInfo | null>(null);
  const [gasCardData, setGasCardData] = useState<GasFeesApiResponse | null>(
    null
  );
  const [showGasCards, setShowGasCards] = useState(false);
  const [level, setLevel] = useState<"low" | "medium" | "high">("medium");
  const { _provider, userKeys } = useContext(appContext);
  const { estimateGas: estimateGasForTransfer, getTokenByName } =
    useTokenStoreContext();
  const { _wallet } = useWalletContext();

  const intervalRef = useRef<NodeJS.Timeout | null>(null); // to store interval ID

  // Fetch gas information globally
  const fetchGasInfo = useCallback(async () => {
    try {
      const currentNetwork = await _provider.getNetwork();
      if (currentNetwork.name.includes("unknown")) {
        const gasFee = await _provider.getFeeData();
        setGasInfo({
          suggestedMaxPriorityFeePerGas:
            gasFee.maxPriorityFeePerGas?.toString() || "0",
          suggestedMaxFeePerGas: gasFee.maxFeePerGas?.toString() || "0",
          minWaitTimeEstimate: 15000,
          maxWaitTimeEstimate: 45000,
        });
      } else {
        const preAuth = btoa(userKeys.apiKey + ":" + userKeys.apiKeySecret);
        const gasApi = `https://gas.api.infura.io/networks/${currentNetwork.chainId}/suggestedGasFees`;

        const gasData = (await new Promise((resolve) => {
          (window as any).MDS.net.GETAUTH(gasApi, preAuth, (resp) => {
            const data = JSON.parse(resp.response);
            setGasCardData(data);
            resolve(data[level]);
          });
        })) as GasInfo;

        setGasInfo(gasData);
      }
    } catch (error) {
      console.error("Failed to fetch Gas API", error);
    }
  }, [_provider, level, userKeys]);

  // Start fetching gas info with interval
  const startFetchingGasInfo = useCallback(() => {
    fetchGasInfo(); // Immediate fetch
    if (!intervalRef.current) {
      intervalRef.current = setInterval(fetchGasInfo, 30000); // Set up polling
    }
  }, [fetchGasInfo]);

  // Stop fetching gas info
  const stopFetchingGasInfo = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current); // Clear the interval
      intervalRef.current = null;
    }
    setGasInfo(null); // Optionally reset gas info
  }, []);

  // Estimate gas function
  async function estimateGas(amount: string, address: string, asset: any) {
    setLoading(true);
    try {
      let gasUnits: string | null = null;

      if (asset.type === "ether") {
        const tx = {
          to: address,
          value: parseEther(amount),
        };
        gasUnits = (await _wallet!.estimateGas(tx)).toString();
      } else {
        gasUnits = await estimateGasForTransfer(
          getTokenByName(asset.name)!.address,
          address,
          amount,
          asset.decimals
        );
      }

      return gasUnits;
    } catch (error) {
      console.error("Error estimating gas:", error);
      return null;
    } finally {
      setLoading(false);
    }
  }

  const promptGasCards = () => {
    setShowGasCards((prevState) => !prevState);
  };

  const clearGas = () => {
    setGasInfo(null);
    setGasCardData(null);
  };

  return (
    <GasContext.Provider
      value={{
        loading,
        gasInfo,
        gasCardData,
        level,
        showGasCards,
        setLevel,
        promptGasCards,
        estimateGas,
        clearGas,
        startFetchingGasInfo,
        stopFetchingGasInfo,
      }}
    >
      {children}
    </GasContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useGasContext = () => {
  const context = useContext(GasContext);
  if (!context)
    throw new Error(
      "GasContext must be called from within the GasContextProvider"
    );

  return context;
};
