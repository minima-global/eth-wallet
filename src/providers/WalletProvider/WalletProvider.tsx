import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import { Wallet, parseUnits, formatEther } from "ethers";

import MinimaABI from "../../abis/Minima.json";
import SimpleMinimaABIHardHat from "../../abis/wMinimaHardhat.json";

import * as utils from "../../utils";
import { appContext } from "../../AppContext";
import { Contract } from "ethers";

const WRAPPEDMINIMANETWORK = {
  "mainnet": {
    abi: MinimaABI,
    address: "0x669c01CAF0eDcaD7c2b8Dc771474aD937A7CA4AF"
  },
  "unknown": {
    abi: SimpleMinimaABIHardHat,
    address: "0x5FbDB2315678afecb367f032d93F642f64180aa3" // edit this after deploying Minima on hardhat
  }
}

type Props = {
  children: React.ReactNode;
};
type Context = {
  _wallet: Wallet | null;
  _balance: string;
  _wrappedMinimaBalance: string;
  _netWorth: number;
  _minimaContract: Contract | null;
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  transfer: (address: string, amount: string) => void;
  transferToken: (address: string, amount: string) => void;
};

const WalletContext = createContext<Context | null>(null);

export const WalletContextProvider = ({ children }: Props) => {
  const { _provider } = useContext(appContext);
  const [_wallet, setWallet] = useState<Wallet | null>(null);
  const [_balance, setBalance] = useState(""); // ether balance
  const [_netWorth, setNetWorth] = useState(0);
  const [_minimaContract, setMinimaContract] = useState<Contract | null>(null);
  const [_wrappedMinimaBalance, setWrappedMinimaBalance] = useState(""); // minima wrapped ether balance
  const [step, setStep] = useState(1);

  useMemo(async () => {
    utils.log("Changing network... - " + _provider.name);
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
    };

    const generatedKey =
      "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    const wallet = new Wallet(generatedKey, _provider);
    const balance = await _provider.getBalance(wallet.address);
    utils.log("Wallet balance: " + balance);
    const networth = await calculateUSDNetWorth(wallet.address);
    setNetWorth(networth);
    setBalance(formatEther(balance));
    setWallet(wallet);

    const currentNetwork = await _provider.getNetwork();

    // we get contract for wMinima.. then we can check balance for user...    
    const wrappedMinimaAddress = WRAPPEDMINIMANETWORK[currentNetwork.name].address;
    const wrappedMinimaABI = WRAPPEDMINIMANETWORK[currentNetwork.name].abi;
    console.log('wrapped minima abi', wrappedMinimaABI);
    const _contract = new Contract(
      wrappedMinimaAddress,
      wrappedMinimaABI,
      _provider
    );
    const _b = await _contract.balanceOf(wallet.address);
    utils.log("Minima balance: " + balance);
    
    setMinimaContract(_contract);
    setWrappedMinimaBalance(formatEther(_b));
  }, [_provider]);

  const transferToken = async (address: string, amount: string) => {
    utils.log(`Preparing a transfer from:${_wallet!.address} to -> ${address}`);

    const currentNetwork = await _provider.getNetwork();
    const wrappedMinimaAddress = WRAPPEDMINIMANETWORK[currentNetwork.name].address;
    const wrappedMinimaABI = WRAPPEDMINIMANETWORK[currentNetwork.name].abi;
    utils.log(wrappedMinimaABI);
    utils.log('wrappedMinimaAddress: ' + wrappedMinimaABI);
    const _contract = new Contract(
      wrappedMinimaAddress,
      wrappedMinimaABI,
      await _provider.getSigner()
    );


    const tx = await _contract.transfer(address, parseUnits(amount, "ether"));

    // return the receipt
    return tx;
  }

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
    console.log(tx);

    return `https://sepolia.etherscan.io/tx/${tx!.hash}`;
  };

  return (
    <WalletContext.Provider
      value={{
        _wallet,
        _balance,
        _wrappedMinimaBalance,
        _netWorth,
        _minimaContract,

        transfer,
        transferToken,

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
