import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import ABI_ERC20 from "../../abis/ERC20.json";
import { Contract,  parseUnits } from "ethers";
import { appContext } from "../../AppContext";
import * as utils from "../../utils";
import { GasFeeCalculated } from "../../types/GasFeeInterface";
import { TransactionResponse } from "ethers";
import { useWalletContext } from "../WalletProvider/WalletProvider";
import { Asset } from "../../types/Asset";

// mainnet Minima address 0x669c01CAF0eDcaD7c2b8Dc771474aD937A7CA4AF
// mainnet USDT address 0xdac17f958d2ee523a2206206994597c13d831ec7
// sepolia Minima address 0x2Bf712b19a52772bF54A545E4f108e9683fA4E2F (self deployed)
// sepolia USDT address 0xb3BEe194535aBF4E8e2C0f0eE54a3eF3b176703C (self deployed)

export const useTokenStoreContext = () => {
  const context = useContext(TokenStoreContext);

  if (!context)
    throw new Error(
      "useTokenStore must be called from within the TokenStoreProvider"
    );

  return context;
};

type Props = {
  children: React.ReactNode;
};
type Context = {
  tokens: Asset[];
  addToken: (token: Asset) => void;
  updateToken: (tokenAddress: string, newBalance: string) => void;
  fetchTokenBalance: (tokenAddress: string) => Promise<string>;
  getTokenByName: (tokenName: string) => Asset | null;
  transferToken: (
    tokenAddress: string,
    recipientAddress: string,
    amount: string,
    gas: GasFeeCalculated
  ) => Promise<TransactionResponse>;
  estimateGas: (
    tokenAddress: string,
    recipientAddress: string,
    amount: string
  ) => Promise<string>;
};

const TokenStoreContext = createContext<Context | null>(null);

export const TokenStoreContextProvider = ({ children }: Props) => {
  const [tokens, setTokens] = useState<Asset[]>([]);
  const { _provider, _defaultAssets } = useContext(appContext);
  const { _wallet: signer } = useWalletContext();

  const fetchTokenBalance = useCallback(
    async (tokenAddress: string) => {
      try {
        // Call balanceOf function
        const contract = new Contract(tokenAddress, ABI_ERC20, _provider);
        const balance = await contract.balanceOf(signer!.address);
        return balance;
      } catch (error) {
        console.error("Error fetching token balance:", error);
        return 0; // Default to 0 balance
      }
    },
    [_provider, signer]
  );

  useEffect(() => {
    if (_defaultAssets) {
      (async () => {
        const calcBalance = await Promise.all(
          _defaultAssets
            .filter((_a) => _a.type !== "ether")
            .map(async (asset) => {
              asset.balance = await fetchTokenBalance(asset.address);
              return asset;
            })
        );
        setTokens(calcBalance);
      })();
    }
  }, [_defaultAssets, fetchTokenBalance]);

  const addToken = (token: Asset) => {
    setTokens((prevTokens) => [...prevTokens, token]);
  };

  const updateToken = (tokenAddress: string, newBalance: string) => {
    setTokens((prevTokens) =>
      prevTokens.map((token) =>
        token.address === tokenAddress
          ? { ...token, balance: newBalance }
          : token
      )
    );
  };

  const getTokenByName = (tokenName: string) => {
    return tokens.find((token) => token.name === tokenName) || null;
  };

  const estimateGas = async (
    tokenAddress: string,
    recipientAddress: string,
    amount: string
  ) => {
    try {
      
      const contract = new Contract(tokenAddress, ABI_ERC20, signer);      
      const gasUnits = await contract.transfer.estimateGas(recipientAddress, parseUnits(amount, 18));
      console.log('gas units', gasUnits);
      
      return gasUnits.toString();
    } catch (error) {
      console.error("Error estimating gas:", error);
      return "0"; // Default to 0 gasUnits
    }
  };

  const transferToken = async (
    tokenAddress: string,
    recipientAddress: string,
    amount: string,
    gas: GasFeeCalculated
  ) => {
    utils.log(`Preparing a transfer to: ${recipientAddress}`);

    const _contract = new Contract(
      tokenAddress,
      ABI_ERC20,
      signer
    );

    const tx = await _contract.transfer(
      recipientAddress,
      parseUnits(amount, "ether"),
      {
        maxFeePerGas: parseUnits(gas.baseFee, "gwei"),
        maxPriorityFeePerGas: parseUnits(gas.priorityFee, "gwei"),
      }
    );
    console.log('txResponse', tx);

    return tx;
  };

  return (
    <TokenStoreContext.Provider
      value={{
        tokens,
        addToken,
        updateToken,
        getTokenByName,
        fetchTokenBalance,
        estimateGas,
        transferToken,
      }}
    >
      {children}
    </TokenStoreContext.Provider>
  );
};
