import { useContext, useState, useEffect, useCallback } from "react";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import Eth from "@ledgerhq/hw-app-eth";
import { appContext } from "../AppContext";

const useLedger = () => {
  const { addUserAccount } = useContext(appContext);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [ledgerTransport, setLedgerTransport] = useState<any | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]); // State to store fetched accounts
  const [accountIndex, setAccountIndex] = useState(5);
  const [accountOffset, setAccountOffset] = useState(0);

  // Function to connect to Ledger and fetch accounts
  const connectLedgerAndGetAccounts = useCallback(
    async () => {
      setLoadingMore(true);
      
      try {
        const transport = await TransportWebUSB.create();
        setLedgerTransport(transport);

        const ethApp = new Eth(transport);
        const derivationPath = (index: number) => `44'/60'/${index}'/0/0`;

        const newAccounts: any = [];
        for (let i = accountOffset; i < accountOffset + accountIndex; i++) {
          const { address } = await ethApp.getAddress(derivationPath(i));
          newAccounts.push({ index: i, address });
        }

        setConnected(true);
        setAccounts(newAccounts); // Append new accounts to the existing list
        return newAccounts;
      } catch (error) {
        console.error("Failed to connect to Ledger:", error);
        setConnected(false);
        return null;
      } finally {
        setLoadingMore(false);
      }
    },
    [accountIndex, accountOffset]
  );

  // Auto-call connectLedgerAndGetAccounts when accountIndex or accountOffset changes
  useEffect(() => {
    console.log("Connect to ledger");

    connectLedgerAndGetAccounts();
  }, [connectLedgerAndGetAccounts]);

  // Function to load more accounts manually
  const loadMoreAccounts = () => {
    // Update accountOffset, which will trigger fetching more accounts
    setAccountOffset((prevOffset) => prevOffset + 5);
  };
  const loadPreviousAccounts = () => {
    // Update accountOffset, which will trigger fetching more accounts
    setAccountOffset((prevOffset) => prevOffset - 5);
  };

  // Manually choose an account (can be called anytime)
  const chooseAccount = async () => {
    const accounts = await connectLedgerAndGetAccounts();

    if (accounts) {
      const selectedAccount = accounts[0]; // For simplicity, selecting the first account
      addSelectedAccount(selectedAccount);
    }
  };

  // Function to add a selected account
  const addSelectedAccount = async (account) => {
    const addAccounts = Array.isArray(account)
      ? account.map((acc) => ({
          nickname: `Ledger Account ${acc.index}`,
          address: acc.address,
          privatekey: undefined,
          current: false,
          type: "ledger",
          bip44Path: `44'/60'/${acc.index}'/0/0`.replace(/'/g, "''"),
        }))
      : [
          {
            nickname: `Ledger Account ${account.index}`,
            address: account.address,
            privatekey: undefined,
            current: false,
            type: "ledger",
            bip44Path: `44'/60'/${account.index}'/0/0`.replace(/'/g, "''"),
          },
        ];

    await addUserAccount(addAccounts);
  };

  // Function to disconnect the Ledger device
  const disconnectLedger = async () => {
    if (ledgerTransport) {
      try {
        await ledgerTransport.close();
        setAccountOffset(0);
        setLedgerTransport(null);
        setConnected(null);
      } catch (error) {
        console.error("Failed to disconnect Ledger:", error);
      }
    } else {
      console.warn("No Ledger device is connected.");
    }
  };

  return {
    connected,
    connectLedgerAndGetAccounts,
    chooseAccount,
    addSelectedAccount,
    disconnectLedger,
    accountIndex,
    setAccountIndex,
    accountOffset,
    setAccountOffset,
    accounts, // Expose the accounts state
    loadingMore,
    loadPreviousAccounts,
    loadMoreAccounts,
  };
};

export default useLedger;
