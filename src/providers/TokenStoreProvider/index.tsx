import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import ABI_ERC20 from "../../abis/ERC20.json";
import { Contract, parseUnits } from "ethers";
import { appContext } from "../../AppContext";
import { GasFeeCalculated } from "../../types/GasFeeInterface";
import { TransactionResponse } from "ethers";
import { useWalletContext } from "../WalletProvider/WalletProvider";
import { Asset } from "../../types/Asset";

type Props = {
  children: React.ReactNode;
};

type Context = {
  tokens: Asset[];
  isLoading: boolean;
  error: string | null;
  addToken: (token: Asset) => void;
  updateToken: (tokenAddress: string, newBalance: string) => void;
  fetchTokenBalance: (tokenAddress: string, decimals: number) => Promise<string>;
  getTokenByName: (tokenName: string) => Asset | null;
  transferToken: (
    tokenAddress: string,
    recipientAddress: string,
    amount: string,
    gas: GasFeeCalculated,
    decimals: number
  ) => Promise<TransactionResponse>;
  estimateGas: (
    tokenAddress: string,
    recipientAddress: string,
    amount: string,
    decimals: number
  ) => Promise<string>;
  retryFetchTokens: () => void;
};

const TokenStoreContext = createContext<Context | null>(null);

export const useTokenStoreContext = () => {
  const context = useContext(TokenStoreContext);

  if (!context)
    throw new Error(
      "useTokenStore must be called from within the TokenStoreProvider"
    );

  return context;
};

export const TokenStoreContextProvider = ({ children }: Props) => {
  const [tokens, setTokens] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { _provider, _defaultAssets, _triggerBalanceUpdate } =
    useContext(appContext);
  const { _wallet: signer, _address } = useWalletContext();

  const fetchTokenBalance = useCallback(
    async (tokenAddress: string): Promise<string> => {
      try {

        const contract = new Contract(tokenAddress, ABI_ERC20, _provider);
        const balance = await contract.balanceOf(_address);
        return balance.toString();
      } catch (err) {
        console.error(`Failed to fetch balance for token ${tokenAddress}:`, err);
        throw err;
      }
    },
    [_provider, _address]
  );

  // Fetch balances for all default tokens
  const fetchAllTokenBalances = useCallback(async () => {
    if (!_address) {
      console.warn("User Address unavailable yet.");
      return;
    }

    if (!_defaultAssets || _defaultAssets.assets.length === 0 || !_provider) {
      console.warn("Default assets or provider not available yet.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const tokenPromises = _defaultAssets.assets
        .filter((asset) => asset.type === "erc20") // Assuming erc20 tokens
        .map(async (asset) => {
          const balance = await fetchTokenBalance(asset.address);
          return { ...asset, balance };
        });

      const fetchedTokens = await Promise.all(tokenPromises);
      setTokens(fetchedTokens);
    } catch (err) {
      setError("Failed to fetch token balances.");
      console.error("Error fetching token balances:", err);
    } finally {
      setIsLoading(false);
    }
  }, [_defaultAssets, _provider, fetchTokenBalance]);

  // Initial fetch and refetch on dependency change
  useEffect(() => {
    fetchAllTokenBalances();
  }, [fetchAllTokenBalances, _triggerBalanceUpdate]);

  // Retry function
  const retryFetchTokens = () => {
    fetchAllTokenBalances();
  };

  const addToken = (token: Asset) => {
    setTokens((prevTokens) => [...prevTokens, token]);
  };

  const updateToken = (tokenAddress: string, newBalance: string) => {
    setTokens((prevTokens) =>
      prevTokens.map((token) =>
        token.address.toLowerCase() === tokenAddress.toLowerCase()
          ? { ...token, balance: newBalance }
          : token
      )
    );
  };

  const getTokenByName = (tokenName: string) => {
    return (
      tokens.find(
        (token) => token.name.toLowerCase() === tokenName.toLowerCase()
      ) || null
    );
  };

  const estimateGas = async (
    tokenAddress: string,
    recipientAddress: string,
    amount: string,
    decimals: number
  ) => {
    try {
      const contract = new Contract(tokenAddress, ABI_ERC20, signer);
      const gasUnits = await contract.transfer.estimateGas(
        recipientAddress,
        parseUnits(amount, decimals)
      );
      return gasUnits.toString();
    } catch (error) {
      console.error("Error estimating gas:", error);
      throw error;
    }
  };

  const transferToken = async (
    tokenAddress: string,
    recipientAddress: string,
    amount: string,
    gas: GasFeeCalculated,
    decimals: number
  ) => {
    try {
      const contract = new Contract(tokenAddress, ABI_ERC20, signer);
      const tx: TransactionResponse = await contract.transfer(
        recipientAddress,
        parseUnits(amount, decimals),
        {
          maxFeePerGas: parseUnits(gas.baseFee, "gwei"),
          maxPriorityFeePerGas: parseUnits(gas.priorityFee, "gwei"),
        }
      );
      return tx;
    } catch (error) {
      console.error("Error transferring token:", error);
      throw error;
    }
  };

  return (
    <TokenStoreContext.Provider
      value={{
        tokens,
        isLoading,
        error,
        addToken,
        updateToken,
        getTokenByName,
        fetchTokenBalance,
        estimateGas,
        transferToken,
        retryFetchTokens,
      }}
    >
      {children}
    </TokenStoreContext.Provider>
  );
};
