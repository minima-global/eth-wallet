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
import { TransactionReceipt } from "ethers";
import { GasFeeCalculated } from "../GasProvider/GasFeeInterface";

const WRAPPEDMINIMANETWORK = {
  mainnet: {
    abi: MinimaABI,
    address: "0x669c01CAF0eDcaD7c2b8Dc771474aD937A7CA4AF",
  },
  unknown: {
    abi: SimpleMinimaABIHardHat,
    address: "0xd56e6f296352b03c3c3386543185e9b8c2e5fd0b", // edit this after deploying Minima on hardhat
  },
};

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
  transfer: (address: string, amount: string, gas: GasFeeCalculated) => Promise<TransactionReceipt>;
  transferToken: (
    address: string,
    amount: string,
    gas: GasFeeCalculated
  ) => Promise<TransactionReceipt>;
};

const WalletContext = createContext<Context | null>(null);

export const WalletContextProvider = ({ children }: Props) => {
  const { _provider, _generatedKey } = useContext(appContext);
  const [_wallet, setWallet] = useState<Wallet | null>(null);
  const [_balance, setBalance] = useState(""); // ether balance
  const [_netWorth, setNetWorth] = useState(0);
  const [_minimaContract, setMinimaContract] = useState<Contract | null>(null);
  const [_wrappedMinimaBalance, setWrappedMinimaBalance] = useState(""); // minima wrapped ether balance
  const [step, setStep] = useState(1);


  useMemo(async () => {
    console.log('calling again');
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

    const wallet = new Wallet(_generatedKey, _provider);
    const balance = await _provider.getBalance(wallet.address);
    // utils.log("Wallet balance: " + balance);
    const networth = await calculateUSDNetWorth(wallet.address);
    setNetWorth(networth);
    setBalance(formatEther(balance));
    setWallet(wallet);

    const currentNetwork = await _provider.getNetwork();

    try {
      console.log('currentNetwork', currentNetwork);
      // we get contract for wMinima.. then we can check balance for user...
      const wrappedMinimaAddress =
        WRAPPEDMINIMANETWORK[currentNetwork.name].address;      
      const wrappedMinimaABI = WRAPPEDMINIMANETWORK[currentNetwork.name].abi;
      const _contract = new Contract(
        wrappedMinimaAddress,
        wrappedMinimaABI,
        _provider
      );
      const _b = await _contract.balanceOf(wallet.address);
      console.log('wrappedMinimaBalance', _b);
      setWrappedMinimaBalance(formatEther(_b));
      setMinimaContract(_contract);
    } catch (error) {
      //
    }
  }, [_provider, _generatedKey]);

  const transferToken = async (
    address: string,
    amount: string,
    gas: GasFeeCalculated
  ) => {
    utils.log(`Preparing a transfer from:${_wallet!.address} to -> ${address}`);

    const currentNetwork = await _provider.getNetwork();
    const wrappedMinimaAddress =
      WRAPPEDMINIMANETWORK[currentNetwork.name].address;
    const wrappedMinimaABI = WRAPPEDMINIMANETWORK[currentNetwork.name].abi;
    const _contract = new Contract(
      wrappedMinimaAddress,
      wrappedMinimaABI,
      await _provider.getSigner()
    );

    const tx = await _contract.transfer(address, parseUnits(amount, "ether"), {
      maxFeePerGas: parseUnits(gas.baseFee, "gwei"),
      maxPriorityFeePerGas: parseUnits(gas.priorityFee, "gwei"),
    });
    console.log(tx);
    const txResponse = await tx.wait();
    console.log(txResponse);
    // return the receipt
    return txResponse;
  };

  const transfer = async (
    address: string,
    amount: string,
    gas: GasFeeCalculated
  ): Promise<TransactionReceipt> => {
    const tx = await _wallet!
      .sendTransaction({
        to: address,
        value: parseUnits(amount, "ether"),
        maxPriorityFeePerGas: parseUnits(gas.priorityFee, "gwei"), // wei
        maxFeePerGas: parseUnits(gas.baseFee, "gwei"), // wei
      })
      .catch((err) => {
        throw err;
      });
    console.log(tx);
    const txResponse = await tx.wait();
    console.log(txResponse);
    return txResponse as TransactionReceipt;
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
