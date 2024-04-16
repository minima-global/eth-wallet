import React, { createContext, useContext, useState } from "react";
import * as utils from "../../utils";
import { appContext } from "../../AppContext";
import { useWalletContext } from "../WalletProvider/WalletProvider";
import {
  GasFeeCalculated,
  GasFeesApiResponse,
} from "../../types/GasFeeInterface";
import { formatUnits, parseEther } from "ethers";
import { useTokenStoreContext } from "../TokenStoreProvider";
import { Asset } from "../../types/Asset";
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
  gasCard: GasFeesApiResponse | null;
  defaultGas: string;
  selectGasCard: (level: string) => void;
  estimateGas: (amount: string, address: string, asset: Asset) => Promise<void>;
  clearGas: () => void;
  showGasCards: boolean;
  promptGasCards: () => void;
  asset: Asset | null;
};

const GasContext = createContext<Context | null>(null);

export const GasContextProvider = ({ children }: Props) => {
  // this will help us retriee the context of what the user inputs are..
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(false);
  const [gasCard, setGasCard] = useState<GasFeesApiResponse | null>(null);
  const [defaultGas, setGasDefault] = useState("medium");
  const [gas, setGas] = useState<GasFeeCalculated | null>(null);
  const [showGasCards, setShowGasCards] = useState(false);

  const { _provider, userKeys } = useContext(appContext);
  const { estimateGas: estimateGasForTransfer, getTokenByName } =
    useTokenStoreContext();
  const { _wallet } = useWalletContext();

  async function estimateGas(amount: string, address: string, asset: Asset) {
    setGas(null);
    setLoading(true);
    setAsset(asset);
    const currentNetwork = await _provider.getNetwork();

    if (currentNetwork.name === "unknown") {
      const gasFee = await _provider.getFeeData();
      const { maxFeePerGas, maxPriorityFeePerGas } = gasFee; // wei

      if (asset.type === "ether") {
        const tx = {
          to: address,
          value: parseEther(amount),
        };
        // Estimate gas required for the transaction
        const gasUnits = await _wallet!.estimateGas(tx); // gas units
        // handler if base fee switched off
        if (maxFeePerGas === null) {
          return setGas({
            gasUnits: gasUnits.toString(),
            baseFee: "0",
            priorityFee: "0",
            finalGasFee: "0",
          });
        }

        const maxBase = formatUnits(maxFeePerGas.toString(), "gwei"); // gwei
        const maxPriority = formatUnits(
          maxPriorityFeePerGas.toString(),
          "gwei"
        ); // gwei

        const _gas = await utils.calculateGasFee(
          gasUnits.toString(),
          maxBase.toString(),
          maxPriority.toString()
        );
        setGas({
          gasUnits: gasUnits.toString(),
          baseFee: _gas.baseFee.toString(),
          priorityFee: _gas.priorityFee.toString(),
          finalGasFee: _gas.finalGasFee.toString(),
        });
      }

      if (asset.type === "erc20") {
        const tokenAddress = getTokenByName(asset.name)!.address;

        const gasUnits = await estimateGasForTransfer(
          tokenAddress,
          address,
          amount
        );

        // handler if base fee switched off
        if (maxFeePerGas === null) {
          return setGas({
            gasUnits: gasUnits.toString(),
            baseFee: "0",
            priorityFee: "0",
            finalGasFee: "0",
          });
        }

        const maxBase = formatUnits(maxFeePerGas.toString(), "gwei"); // gwei
        const maxPriority = formatUnits(
          maxPriorityFeePerGas.toString(),
          "gwei"
        ); // gwei

        const _gas = await utils.calculateGasFee(
          gasUnits,
          maxBase.toString(),
          maxPriority.toString()
        );
        setGas({
          gasUnits: gasUnits.toString(),
          baseFee: _gas.baseFee.toString(),
          priorityFee: _gas.priorityFee.toString(),
          finalGasFee: _gas.finalGasFee.toString(),
        });
      }
    }

    if (currentNetwork.name !== "unknown") {
      try {
        const preAuth = btoa(userKeys.apiKey + ":" + userKeys.apiKeySecret);
        const gasApi = `https://gas.api.infura.io/networks/${currentNetwork.chainId}/suggestedGasFees`;

        (window as any).MDS.net.GETAUTH(gasApi, preAuth, (resp) => {
          const data = JSON.parse(resp.response);

          // Set Gas Card data
          setGasCard(data);

          const { suggestedMaxFeePerGas, suggestedMaxPriorityFeePerGas } =
            data[defaultGas];

          if (asset.type === "erc20") {
            const tokenAddress = getTokenByName(asset.name)!.address;

            (async () => {
              const gasUnits = await estimateGasForTransfer(
                tokenAddress,
                address,
                amount
              );

              const gas = await utils.calculateGasFee(
                gasUnits.toString(),
                suggestedMaxFeePerGas,
                suggestedMaxPriorityFeePerGas
              );
              setGas(gas);
            })();
          }

          if (asset.type === "ether") {
            const tx = {
              to: address,
              value: parseEther(amount),
            };
            (async () => {
              const gasUnits = await _wallet!.estimateGas(tx); // gas units
              const gas = await utils.calculateGasFee(
                gasUnits.toString(),
                suggestedMaxFeePerGas,
                suggestedMaxPriorityFeePerGas
              );
              setGas(gas);
            })();
            // Estimate gas required for the transaction
          }
        });
      } catch (error) {
        // console.log("Server responded with:", error);
      } finally {
        setLoading(false);
      }
    }
  }

  const promptGasCards = () => {
    setShowGasCards((prevState) => !prevState);
  };

  const clearGas = () => {
    setGas(null);
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
