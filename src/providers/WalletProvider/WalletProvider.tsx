import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import { Wallet, parseUnits, formatEther, Contract, parseEther } from "ethers";
import { appContext } from "../../AppContext";
import { GasFeeCalculated } from "../../types/GasFeeInterface";
import { TransactionResponse } from "ethers";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { computePoolAddress } from "@uniswap/v3-sdk";
import { POOL_FACTORY_CONTRACT_ADDRESS } from "../../constants";
import { CurrentConfig } from "../QuoteProvider/config";

import ABI_ERC20 from "../../abis/ERC20.json";



type Props = {
  children: React.ReactNode;
};
type Context = {
  _address: string | null;
  _network: string;
  _chainId: string | null;
  _wallet: Wallet | null;
  _balance: string;
  _poolContract: Contract | null;
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  transfer: (address: string, amount: string, gas: GasFeeCalculated) => Promise<TransactionResponse>;
};

const WalletContext = createContext<Context | null>(null);

export const WalletContextProvider = ({ children }: Props) => {
  const { _provider, _generatedKey } = useContext(appContext);
  const [_network, setNetwork] = useState("");
  const [_chainId, setChainId] = useState<string | null>(null);
  const [_wallet, setWallet] = useState<Wallet | null>(null);
  const [_address, setAddress] = useState<string | null>(null);
  const [_balance, setBalance] = useState(""); // ether balance
  const [_poolContract, setPoolContract] = useState<Contract | null>(null); // ether balance
  const [step, setStep] = useState(1);

  const fundMeWithMinimaEthersAndUSDT = async (addr: string) => {
    
    const mC = new Contract("0x669c01CAF0eDcaD7c2b8Dc771474aD937A7CA4AF", ABI_ERC20, _provider);
    const b = await mC.balanceOf("0x5534fF8d19EBF33D8e57C552f88d3A5dEE4fb669");
    console.log('minima whale balance', b);
    
    const tC = new Contract("0xdac17f958d2ee523a2206206994597c13d831ec7", ABI_ERC20, _provider);
    const bT = await tC.balanceOf("0xF977814e90dA44bFA03b6295A0616a897441aceC");
    console.log('tether whale balance', bT);
    // whales
    const minima =  await _provider.getSigner("0x5534fF8d19EBF33D8e57C552f88d3A5dEE4fb669"); // minima
    const ether = await  _provider.getSigner("0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec"); // hardhat
    const usdt = await _provider.getSigner("0xF977814e90dA44bFA03b6295A0616a897441aceC"); // binance

    // contracts
    const minimaContract = new Contract("0x669c01CAF0eDcaD7c2b8Dc771474aD937A7CA4AF", ABI_ERC20, minima);
    const usdtContract = new Contract("0xdac17f958d2ee523a2206206994597c13d831ec7", ABI_ERC20, usdt);


    await minimaContract.transfer(
      addr,
      parseUnits("1000", "ether"),      
    );
    await usdtContract.transfer(
      addr,
      parseUnits("1000", "ether"),      
    );
    await ether.sendTransaction({
      to: addr,
      value: parseUnits("1000", "ether"),
    })

  }

  useMemo(async () => {
    if (!_generatedKey || _provider === null) return;

    
    const wallet = new Wallet(_generatedKey, _provider);
    const address = await wallet.getAddress();
    const network = await _provider.getNetwork();

    // const currentPoolAddress = computePoolAddress({
    //   factoryAddress: POOL_FACTORY_CONTRACT_ADDRESS,
    //   tokenA: CurrentConfig.tokens.in,
    //   tokenB: CurrentConfig.tokens.out,
    //   fee: CurrentConfig.tokens.poolFee,
    // })
    // console.log('current pool address: ' + currentPoolAddress);
    const poolContract = new Contract(
      "0x8E427a754b13Fa1A165Db583120daf7c3aBe4019",
      IUniswapV3PoolABI.abi,
      wallet
    );
    setPoolContract(poolContract);

    const balance = await _provider.getBalance(wallet.address);
    setBalance(formatEther(balance));
    setWallet(wallet);
    setNetwork(network.name);
    setAddress(address);
    setChainId(network.chainId);

  }, [_provider, _generatedKey]);

  /**
   * 
   * @param address receiver address
   * @param amount amount (ether)
   * @param gas suggested gas fee
   * @returns the immediate response of this transaction
   */
  const transfer = async (
    address: string,
    amount: string,
    gas: GasFeeCalculated
  ): Promise<TransactionResponse> => {
    
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

    return tx;
  };



  return (
    <WalletContext.Provider
      value={{
        _address,
        _network,
        _chainId,
        _wallet,
        _balance,
        _poolContract,
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
