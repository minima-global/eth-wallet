import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import {  Wallet,  parseUnits, formatEther } from "ethers";

import * as utils from "../../utils";
import { appContext } from "../../AppContext";


type Props = {
  children: React.ReactNode;
};
type Context = {
  // key: string | null;
  // phrase: string | null;

  _wallet: Wallet | null;
  _balance: string;
  _netWorth: number;
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  transfer: (address: string, amount: string) => void;

  // createWallet: (_password: string) => void;
  // anitaMoney: () => Promise<string>;
  // loadWallet: (_password: string) => void;
};

// Just find-replace "XContext" with whatever context name you like. (ie. DankContext)
const WalletContext = createContext<Context | null>(null);

export const WalletContextProvider = ({ children }: Props) => {
  const { _provider } = useContext(appContext);

  const [_wallet, setWallet] = useState<Wallet | null>(null);
  const [_balance, setBalance] = useState("");
  const [_netWorth, setNetWorth] = useState(0);
  const [step, setStep] = useState(1);

  // when provider changes change wallet
  useMemo(async () => {
    utils.log("Changing network...");
    const generatedKey =
      "0x689af8efa8c651a91ad287602527f3af2fe9f6501a7ac4b061667b5a93e037fd";
    const wallet = new Wallet(generatedKey, _provider);
    const balance = await _provider.getBalance(wallet.address);
    utils.log(typeof balance === 'string' ? 'string': 'not')
    utils.log('Wallet balance: '+ balance);
    const networth = await calculateUSDNetWorth(wallet.address);
    setNetWorth(networth);
    setBalance(formatEther(balance));
    setWallet(wallet);
  }, [_provider]);
  

  const transfer = async (address: string, amount: string) => {
    utils.log("Preparing a transfer from " + _wallet!.address);

    const tx = await _wallet
      ?.sendTransaction({
        to: address,
        value: parseUnits(amount, "ether"),
      })
      .catch((err) => {
        console.log("Error caught...");
        throw err;
      });
    console.log("Returning..");

    return `https://sepolia.etherscan.io/tx/${tx!.hash}`;
  };

  const calculateUSDNetWorth = async (address: string) => {
    try {      
      const etherPriceUSD = await utils.getEthereumPrice();          
      const etherHoldings = await _provider.getBalance(address);            
      
      const netWorthUSD = Number(formatEther(etherHoldings)) * etherPriceUSD;
  
      return netWorthUSD;
    } catch (error) {
      console.error(error);
      return 0;
    }
  }

  return (
    <WalletContext.Provider
      value={{
        _wallet,
        _balance,
        _netWorth,
        
        transfer,

        step,
        setStep,
        
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => {
  const context = useContext(WalletContext);

  if (!context)
    throw new Error(
      "WalletContext must be called from within the WalletContextProvider"
    );

  return context;
};
