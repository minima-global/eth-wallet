import React, {
    createContext,
    useContext,
  } from "react";
  
import { appContext } from "../../AppContext";
import { TransactionResponse } from "ethers";
import { TransactionReceipt } from "ethers";
  
  
  type Props = {
    children: React.ReactNode;
  };
  type Context = {
    transactionStatusHandler: (transactionResponse: TransactionResponse) => void;
    getTransactionReceipt: (txHahs: string) => Promise<TransactionReceipt>;
  };
  
  const ActivityHandlerContext = createContext<Context | null>(null);
  
  export const ActivityHandlerContextProvider = ({ children }: Props) => {
    const { _provider, _activities, updateActivities } = useContext(appContext);
    

    const transactionStatusHandler = async (transactionResponse) => {
      
      try {
        await transactionResponse.wait();
        console.log('Transaction finished');
        const txReceipt = _provider.getTransactionReceipt(transactionResponse.hash);
        console.log(txReceipt);
        updateActivities(txReceipt);  
        
      } catch (error) {
        console.error(error);
        // TODO: handle error
      }
    }

    const getTransactionReceipt = async (txHash: string) => {
      try {
        const txReceipt = await _provider.getTransactionReceipt(txHash);

        return txReceipt;      
      } catch (error) {
        return null;
      }
    }
  
  
  
  
    return (
      <ActivityHandlerContext.Provider
        value={{
          transactionStatusHandler,
          getTransactionReceipt
        
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
  