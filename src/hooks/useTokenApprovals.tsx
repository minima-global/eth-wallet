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
    // Create ERC-20 token contract instance
    const tokenContract = new Contract(tokenAddress, ERC20_ABI, _provider);

    // Return a promise
    return tokenContract
      .allowance(_address, SWAP_ROUTER_ADDRESS)
      .then((allowance) => {

        const allowanceDecimal = new Decimal(allowance.toString());
        const requiredAmountDecimal = new Decimal(requiredAmount);

        // Compare the two Decimal objects
        if (allowanceDecimal.lt(requiredAmountDecimal)) {
          return true;
        } else if (allowanceDecimal.gte(requiredAmountDecimal)) {
          return false;
        }
      })
      .catch(() => {
        return true;
      });
  };

  return checkAllowances;
};

export default useTokenApprovals;
