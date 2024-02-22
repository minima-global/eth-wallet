import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import * as utils from "../../utils";
import { appContext } from "../../AppContext";
import { useWalletContext } from "../WalletProvider/WalletProvider";
import { GasFeeCalculated, GasFeesApiResponse } from "./GasFeeInterface";
import Decimal from "decimal.js";
import {  formatUnits, parseEther } from "ethers";
/**
 * @EIP1559
 * Calculating gas fee as with EIP1559,
 * (BASE FEE + PRIORITY FEE) X UNITS OF GAS USED
 */

/** We create a base64 encoded token for authorisation header */
const encoder = new TextEncoder();
const preAuth = encoder.encode(
  import.meta.env.VITE_INFURA_API_KEY +
    ":" +
    import.meta.env.VITE_INFURA_API_KEY_SECRET
);
// Convert JSON object to Uint8Array
const uint8Array = new Uint8Array(Object.values(preAuth));
const Auth = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)));

type Props = {
  children: React.ReactNode;
};
type Context = {
  // unknown
  loading: boolean;
  gas: GasFeeCalculated | null;
  transactionTotal: string | null;
  gasCard: GasFeesApiResponse | null;
  defaultGas: string;
  selectGasCard: (level: string) => void;
  estimateGas: (amount: string, address: string, asset: string) => void;
  clearGas: () => void;
  showGasCards: boolean;
  promptGasCards: () => void;
  asset: string;
};

const GasContext = createContext<Context | null>(null);

export const GasContextProvider = ({ children }: Props) => {
  // this will help us retriee the context of what the user inputs are..
  const [asset, setAsset] = useState("ether");
  const [loading, setLoading] = useState(false);
  const [gasCard, setGasCard] = useState<GasFeesApiResponse | null>(null);
  const [defaultGas, setGasDefault] = useState("medium");
  const [gas, setGas] = useState<GasFeeCalculated | null>(null);
  const [transactionTotal, setTransactionTotal] = useState<string | null>(null);
  const [showGasCards, setShowGasCards] = useState(false);

  const { _provider } = useContext(appContext);
  const { _wallet, _minimaContract } = useWalletContext();

  async function estimateGas(amount: string, address: string, asset: string) {
    setLoading(true);
    setAsset(asset);
    const currentNetwork = await _provider.getNetwork();

    if (currentNetwork.name === "unknown") {
      const gasFee = await _provider.getFeeData();
      const { maxFeePerGas, maxPriorityFeePerGas } = gasFee; // wei 

      if (asset === "ether") {
        console.log("gas", gasFee);
        const tx = {
          to: address,
          value: parseEther(amount),
        };
        // Estimate gas required for the transaction
        const gasUnits = await _wallet!.estimateGas(tx); // gas units        
        const maxBase = formatUnits(maxFeePerGas.toString(), "gwei"); // gwei        
        const maxPriority = formatUnits(maxPriorityFeePerGas.toString(), "gwei"); // gwei
        
        const _gas = await utils.calculateGasFee(gasUnits, maxBase.toString(), maxPriority.toString());        
        setGas({
          gasUnits: gasUnits.toString(),
          baseFee: _gas.baseFee.toString(),
          priorityFee: _gas.priorityFee.toString(),
          finalGasFee: _gas.finalGasFee.toString(),
        });
        setTransactionTotal(_gas.finalGasFee.toString());
      }

      if (asset === "minima") {
        console.log("gas", gasFee);
        const gasUnits = await _minimaContract!.transfer.estimateGas(
          address,
          amount
        );
        const maxBase = formatUnits(maxFeePerGas.toString(), "gwei"); // gwei        
        const maxPriority = formatUnits(maxPriorityFeePerGas.toString(), "gwei"); // gwei
        
        const _gas = await utils.calculateGasFee(gasUnits, maxBase.toString(), maxPriority.toString());        
        setGas({
          gasUnits: gasUnits.toString(),
          baseFee: _gas.baseFee.toString(),
          priorityFee: _gas.priorityFee.toString(),
          finalGasFee: _gas.finalGasFee.toString(),
        });
        setTransactionTotal(_gas.finalGasFee.toString());
      }
    }

    if (currentNetwork.name !== "unknown") {
      try {
        const { data } = await axios.get(
          `https://gas.api.infura.io/networks/${currentNetwork.chainId}/suggestedGasFees/`,
          {
            headers: {
              Authorization: `Basic ${Auth}`,
            },
          }
        );
        console.log(data);
        // Set Gas Card data
        setGasCard(data);

        const { suggestedMaxFeePerGas, suggestedMaxPriorityFeePerGas } =
          data[defaultGas];

        if (asset === "minima") {
          const gasUnits = await _minimaContract!.transfer.estimateGas(
            address,
            amount
          );

          const gas = await utils.calculateGasFee(
            gasUnits,
            suggestedMaxFeePerGas,
            suggestedMaxPriorityFeePerGas
          );
          setGas(gas);
          setTransactionTotal(
            new Decimal(amount).plus(gas.finalGasFee).toString()
          );
        }

        if (asset === "ether") {
          const tx = {
            to: address,
            value: parseEther(amount),
          };
          // Estimate gas required for the transaction
          const gasUnits = await _wallet!.estimateGas(tx); // gas units
          const gas = await utils.calculateGasFee(
            gasUnits,
            suggestedMaxFeePerGas,
            suggestedMaxPriorityFeePerGas
          );
          setGas(gas);
          setTransactionTotal(
            new Decimal(amount).plus(gas.finalGasFee).toString()
          );
        }
      } catch (error) {
        console.log("Server responded with:", error);
      } finally {
        setTimeout(() => setLoading(false), 3000);
      }
    }
  }

  const promptGasCards = () => {
    setShowGasCards((prevState) => !prevState);
  };

  const clearGas = () => {
    setGas(null);
    setTransactionTotal(null);
  };

  // user ability to select which card they want to use
  const selectGasCard = (level: string) => {
    setGasDefault(level);
  };

  return (
    <GasContext.Provider
      value={{
        loading,
        gas,
        gasCard,
        defaultGas,
        transactionTotal,
        showGasCards,
        promptGasCards,
        asset,

        selectGasCard,
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
