import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import { Wallet, parseUnits, formatEther, Contract,  Signer, VoidSigner } from "ethers";
import { appContext } from "../../AppContext";
import { GasFeeCalculated } from "../../types/GasFeeInterface";
import { TransactionResponse } from "ethers";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";



type Props = {
  children: React.ReactNode;
};
type Context = {
  _address: string | null;
  _network: string;
  _chainId: string | null;
  _wallet: Signer | null;
  _balance: string;
  _poolContract: Contract | null;
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  transfer: (address: string, amount: string, gas: GasFeeCalculated) => Promise<TransactionResponse>;
  getEthereumBalance: () => void;
  callBalanceForApp: () => void;
};

const WalletContext = createContext<Context | null>(null);

export const WalletContextProvider = ({ children }: Props) => {
  const { _provider, _triggerBalanceUpdate, setTriggerBalanceUpdate, _userAccounts } = useContext(appContext);
  const [_network, setNetwork] = useState("");
  const [_chainId, setChainId] = useState<string | null>(null);
  const [_wallet, setWallet] = useState<Signer | null>(null);
  const [_address, setAddress] = useState<string | null>(null);
  const [_balance, setBalance] = useState(""); // ether balance
  const [_poolContract, setPoolContract] = useState<Contract | null>(null); // ether balance
  const [step, setStep] = useState(1);

  useMemo(async () => {
    const current = _userAccounts.find(account => account.current);

    if (_provider === null || !current) return;

    let wallet;

    if (current.type.includes('normal')) {
      wallet = new Wallet(current.privatekey, _provider);
    } else {
      wallet = new VoidSigner(current.address, _provider);
    }

    const network = await _provider.getNetwork();
    
    const poolContract = new Contract(
      "0x8E427a754b13Fa1A165Db583120daf7c3aBe4019",
      IUniswapV3PoolABI.abi,
      wallet
    );
    setPoolContract(poolContract);

    const balance = await _provider.getBalance(current.address);
    setBalance(formatEther(balance));
    setNetwork(network.name);
    setAddress(current.address);
    setChainId(network.chainId);
    
    // this'll be null if it is not defined.. so it's ledger
    setWallet(wallet);
  }, [_provider, _userAccounts]);

  const callBalanceForApp = async () => {
    // If there is already an on-going balance call.. stop

    if (_triggerBalanceUpdate) return;

    // Trigger balance update for ERC-20s...
    setTriggerBalanceUpdate(true);

    // Getting Ethereum Balance
    getEthereumBalance();

    // Trigger Ethereum Balance update...
    setTimeout(() => {
      setTriggerBalanceUpdate(false);
    }, 2000);
  };

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

  const getEthereumBalance = async () => {
    if (!_provider) return;
    const balance = await _provider.getBalance(_address);
    setBalance(formatEther(balance));
  }


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
      
        getEthereumBalance,
        callBalanceForApp
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
