import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { listen } from "@ledgerhq/logs";
import Eth from "@ledgerhq/hw-app-eth";
import { useState } from "react";

const useLedger = () => {
    const [connected, setConnected] = useState<boolean | null>(null);
    const [ledgerTransport, setLedgerTransport] = useState<TransportWebUSB | null>(null);

    const init = async () => {
        try {
            console.log("Initializing Ledger...");

            // Establish a connection with the Ledger device using WebUSB
            const transport = await TransportWebUSB.create();
            setLedgerTransport(transport);

            // Listen to the events for debugging purposes
            listen(log => console.log(log));

            // Create an instance of the Ethereum app
            const appEth = new Eth(transport);
            const { address } = await appEth.getAddress("44'/60'/0'/0/0");

            console.log('Your ETH address:', address);
            setConnected(true);

        } catch (error) {
            console.error("Failed to initialize Ledger:", error);
            setConnected(false);
        }
    };

    const connectLedgerAndGetAccounts = async () => {
        setConnected(null);

        try {
            // Establish a connection with the Ledger device using WebUSB
            const transport = await TransportWebUSB.create();
            setLedgerTransport(transport);

            // Create an instance of the Ethereum app
            const ethApp = new Eth(transport);

            // Path format for Ethereum accounts according to BIP44: m/44'/60'/account'/change/address_index
            const derivationPath = (index: number) => `44'/60'/${index}'/0/0`;

            // Ask for accounts and their addresses
            const accounts: any = [];
            for (let i = 0; i < 5; i++) {  // Example: fetching first 5 accounts
                const { address } = await ethApp.getAddress(derivationPath(i));
                accounts.push({ index: i, address });
            }

            // Set connected status to true and return the list of accounts
            setConnected(true);
            return accounts;

        } catch (error) {
            console.error("Failed to connect to Ledger:", error);
            setConnected(false);
            return null;
        }
    };

    const chooseAccount = async () => {
        const accounts = await connectLedgerAndGetAccounts();

        if (accounts) {
            // Display the accounts and let the user choose one
            console.log("Available accounts:", accounts);
            const selectedAccount = accounts[0]; // For simplicity, selecting the first account
            console.log("Selected account:", selectedAccount);

            // Proceed to add the selected account to your app
            addSelectedAccount(selectedAccount);
        }
    };

    const addSelectedAccount = (selectedAccount: { index: number; address: string }) => {
        // Add the selected account to your application's state or database
        console.log("Adding account to app:", selectedAccount);
        // For example, you could store the selected account in state or local storage
    };

    const disconnectLedger = async () => {
        if (ledgerTransport) {
            try {
                await ledgerTransport.close();
                setLedgerTransport(null);  // Clear the transport instance
                setConnected(null);  // Update connection status
                console.log("Ledger disconnected successfully.");
            } catch (error) {
                console.error("Failed to disconnect Ledger:", error);
            }
        } else {
            console.warn("No Ledger device is connected.");
        }
    };

    return {
        init,
        connected,
        connectLedgerAndGetAccounts,
        chooseAccount,
        addSelectedAccount,
        disconnectLedger // Include the disconnect method
    };
};

export default useLedger;
