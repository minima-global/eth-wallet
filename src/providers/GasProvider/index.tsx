import React, { createContext, useContext, useState } from "react";
// import * as utils from "../../utils";
// import { appContext } from "../../AppContext";
import { useWalletContext } from "../WalletProvider/WalletProvider";
import {
  GasFeeCalculated
} from "../../types/GasFeeInterface";
import { parseEther } from "ethers";
import { useTokenStoreContext } from "../TokenStoreProvider";
/**
 * @EIP1559
 * Calculating gas fee as with EIP1559,
 * (BASE FEE + PRIORITY FEE) X UNITS OF GAS USED
 */

type Props = {
  children: React.ReactNode;
};
type Context = {
  loading: boolean;
  gas: GasFeeCalculated | null;
  level: "low" | "medium" | "high";
  estimateGas: (amount: string, address: string, asset: any) => Promise<string | null>;
  clearGas: () => void;
  setLevel: any;
  showGasCards: boolean;
  promptGasCards: () => void;
};

const GasContext = createContext<Context | null>(null);

export const GasContextProvider = ({ children }: Props) => {
  const [loading, setLoading] = useState(false);
  const [gas, setGas] = useState<GasFeeCalculated | null>(null);
  const [showGasCards, setShowGasCards] = useState(false);
  const [level, setLevel] = useState<"low" | "medium" | "high"> ("medium");
  // const { _provider, userKeys } = useContext(appContext);
  const { estimateGas: estimateGasForTransfer, getTokenByName } =
    useTokenStoreContext();
  const { _wallet } = useWalletContext();

  async function estimateGas(amount: string, address: string, asset: any) {
    setLoading(true);
    try {
      if (asset.type === 'ether') {
        // normal txn
        const tx = {
          to: address,
          value: parseEther(amount),
        };
        // Estimate gas required for the transaction
        const gasUnits = await _wallet!.estimateGas(tx); // gas units
  
        return gasUnits.toString();
      } else {
        // erc20
        const gasUnits = await estimateGasForTransfer(
          getTokenByName(asset.name)!.address,
          address,
          amount,
          asset.decimals
        );

        return gasUnits.toString();
      }
      
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
    setGas(null);
  };

  return (
    <GasContext.Provider
      value={{
        loading,
        gas,
        level,
        showGasCards,
        setLevel,
        promptGasCards,
        estimateGas,
        clearGas,
      }}
    >
      {children}
    </GasContext.Provider>
  );
};

export const useGasContext = () => {
  const context = useContext(GasContext);
  if (!context)
    throw new Error(
      "GasContext must be called from within the GasContextProvider"
    );

  return context;
};
