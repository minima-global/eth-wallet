import { Contract, formatUnits } from "ethers";
import { useWalletContext } from "../providers/WalletProvider/WalletProvider";
import { useContext, useEffect } from "react";
import { appContext } from "../AppContext";
import erc20Abi from "../abis/ERC20.json";
import { useTokenStoreContext } from "../providers/TokenStoreProvider";

const useBlockchainHistory = () => {
    const { _provider, _currentNavigation } = useContext(appContext);
    const { _address } = useWalletContext();
    const { tokens } = useTokenStoreContext();

    const getAllTransfersToMyAddress = async () => {
        if (!_address) return null;

    for (const token of tokens) {
        const contract = new Contract(token.address, erc20Abi, _provider);

        // Create a filter for Transfer events involving the specified address
        const filterFrom = contract.filters.Transfer(_address, null);
        const filterTo = contract.filters.Transfer(null, _address);

        // Query the blockchain for past events matching the filter
        const eventsFrom = await contract.queryFilter(filterFrom);
        const eventsTo = await contract.queryFilter(filterTo);

        console.log(`\nTransfers involving ${_address} for token contract ${token.address}:`);

        // Print out the details of each event (from)
        eventsFrom.forEach(event => {
            console.log(`\nTransfer from:`);
            console.log(`From: ${event.args.from}`);
            console.log(`To: ${event.args.to}`);
            console.log(`Value: ${formatUnits(event.args.value, token.decimals)}`);
            console.log(`Block Number: ${event.blockNumber}`);
            console.log(`Transaction Hash: ${event.transactionHash}`);
        });

        // Print out the details of each event (to)
        eventsTo.forEach(event => {
            console.log(`\nTransfer to:`);
            console.log(`From: ${event.args.from}`);
            console.log(`To: ${event.args.to}`);
            console.log(`Value: ${formatUnits(event.args.value, token.decimals)}`);
            console.log(`Block Number: ${event.blockNumber}`);
            console.log(`Transaction Hash: ${event.transactionHash}`);
        });
    }
    }


    useEffect(() => {
        getAllTransfersToMyAddress();


    }, [_currentNavigation]);


    return {
     // something later..   
    }
}

export default useBlockchainHistory;