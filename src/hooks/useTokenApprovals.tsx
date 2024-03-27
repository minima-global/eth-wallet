import { Contract } from "ethers";
import { useContext } from "react";
import {
  ERC20_ABI,
  SWAP_ROUTER_ADDRESS,
} from "../providers/QuoteProvider/libs/constants";
import { appContext } from "../AppContext";
import { useWalletContext } from "../providers/WalletProvider/WalletProvider";
import Decimal from "decimal.js";

const useTokenApprovals = () => {
  const { _provider } = useContext(appContext);
  const { _address } = useWalletContext();

  const checkAllowances = async (
    tokenAddress: string,
    requiredAmount: string
  ) => {
    console.log(requiredAmount);
    // Create ERC-20 token contract instance
    const tokenContract = new Contract(tokenAddress, ERC20_ABI, _provider);

    // Return a promise
    return tokenContract
      .allowance(_address, SWAP_ROUTER_ADDRESS)
      .then((allowance: any) => {
        console.log('Allowance', allowance.toString());
        // Check if allowance is sufficient
        if (new Decimal(allowance.toString).gt(0) && new Decimal(allowance.toString()).gte(requiredAmount)) {
          console.log("User has approved tokens for spending by the contract");
          // Proceed with desired action in your contract
          return true;
        } else {
          console.log(
            "User has not approved sufficient tokens for spending by the contract"
          );
          // Prompt user to approve tokens or adjust contract logic accordingly
          throw new Error("Insufficient allowance");
        }
      })
      .catch(() => {        
        return false;
      });
  };

  return checkAllowances;
};

export default useTokenApprovals;
