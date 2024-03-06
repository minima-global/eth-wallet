import React, { createContext, useContext, useState } from "react";

import { appContext } from "../../AppContext";
import { TransactionResponse } from "ethers";
import { TransactionReceipt } from "ethers";
import { useWalletContext } from "../WalletProvider/WalletProvider";

type Props = {
  children: React.ReactNode;
};
type Context = {
  history: TransactionResponse[] | null;
  fetchLatestHistory: () => void;
  transactionStatusHandler: (transactionResponse: TransactionResponse) => void;
  getTransactionReceipt: (txHahs: string) => Promise<TransactionReceipt>;
};

const ActivityHandlerContext = createContext<Context | null>(null);

export const ActivityHandlerContextProvider = ({ children }: Props) => {
  const { _provider, updateActivities, _etherscanProvider } = useContext(appContext);
  const { _address } = useWalletContext();
  const [history, setHistory] = useState<TransactionResponse[] | null>(null);

  const getTransactionHistory = async (): Promise<TransactionResponse[]> => {
    try {
      const history = await _etherscanProvider.getHistory(_address);
      return history;
    } catch (error) {
      console.error("Error retrieving transaction history:", error);
      return [];
    }
  };

  const fetchLatestHistory = async () => {
    const history = await getTransactionHistory();
    setHistory(history);
  }

  const transactionStatusHandler = async (transactionResponse) => {
    try {
      await transactionResponse.wait();
      const txReceipt = _provider.getTransactionReceipt(
        transactionResponse.hash
      );
      updateActivities(txReceipt);
    } catch (error) {
      console.error(error);
      // TODO: handle error
    }
  };

  const getTransactionReceipt = async (txHash: string) => {
    try {
      const txReceipt = await _provider.getTransactionReceipt(txHash);

      return txReceipt;
    } catch (error) {
      return null;
    }
  };

  return (
    <ActivityHandlerContext.Provider
      value={{
        history,
        fetchLatestHistory,
        transactionStatusHandler,
        getTransactionReceipt,
      }}
    >
      {children}
    </ActivityHandlerContext.Provider>
  );
};

export const useActivityHandlerContext = () => {
  const context = useContext(ActivityHandlerContext);

  if (!context)
    throw new Error(
      "WalletContext must be called from within the WalletContextProvider"
    );

  return context;
};
