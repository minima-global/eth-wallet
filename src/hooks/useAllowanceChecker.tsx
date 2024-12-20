import { useContext, useEffect } from "react";
import { appContext } from "../AppContext.js";
import { _defaults } from "../constants/index.js";
import { Contract, MaxUint256, parseUnits } from "ethers";

import ERC20ABI from "../abis/ERC20.json";
import { useWalletContext } from "../providers/WalletProvider/WalletProvider.js";
import Decimal from "decimal.js";
import { SWAP_ROUTER_ADDRESS } from "../providers/QuoteProvider/libs/constants.js";

const useAllowanceChecker = () => {
  const { _provider, setAllowanceLock, _promptAllowance } = useContext(appContext);
  const { _network: currentNetwork, _address } = useWalletContext();

  const checkAllowance = (
    token: "Tether" | "wMinima",
    spendingAmount: string,
    tokenDecimals: number
  ) => {
    const erc20ContractAddress = _defaults[token][currentNetwork];

    const erc20Contract = new Contract(
      erc20ContractAddress,
      ERC20ABI,
      _provider
    );

    return new Promise((resolve, reject) => {
      erc20Contract
        .allowance(_address, SWAP_ROUTER_ADDRESS)
        .then((allowance) => {
          const requiredAmountToWei = parseUnits(spendingAmount, tokenDecimals);
          const allowanceDecimal = new Decimal(allowance.toString());
          const requiredAmountDecimal = new Decimal(
            requiredAmountToWei.toString()
          );

          // Compare the two Decimal objects
          if (
            allowanceDecimal.lt(requiredAmountDecimal) &&
            requiredAmountDecimal.lt(MaxUint256.toString())
          ) {
            resolve(true);
          } else if (allowanceDecimal.gte(requiredAmountDecimal)) {
            reject();
          }
        });
    });
  };

  useEffect(() => {
    const tetherContractAddress = _defaults["Tether"][currentNetwork];
    const wMinimaContractAddress = _defaults["wMinima"][currentNetwork];

    const wrappedMinimaContract = new Contract(
      wMinimaContractAddress,
      ERC20ABI,
      _provider
    );
    const tetherContract = new Contract(
      tetherContractAddress,
      ERC20ABI,
      _provider
    );

    const allowances: Promise<bigint>[] = [
      new Promise((resolve) => {
        wrappedMinimaContract
          .allowance(_address, SWAP_ROUTER_ADDRESS)
          .then((result) => {
            resolve(result);
          });
      }),
      new Promise((resolve) => {
        tetherContract
          .allowance(_address, SWAP_ROUTER_ADDRESS)
          .then((result) => {
            resolve(result);
          });
      }),
    ];

    (async () => {
      const userAllowances = await Promise.all(allowances);

      // If allowances for both are at zero let's max them up...      
      const wrappedAllowance = userAllowances[0];
      const tetherAllowance = userAllowances[1];

      if (new Decimal(wrappedAllowance.toString()).isZero() || new Decimal(tetherAllowance.toString()).isZero()) {
        setAllowanceLock({wminima: new Decimal(wrappedAllowance.toString()).isZero(), tether: new Decimal(tetherAllowance.toString()).isZero()});
      } else {        
        setAllowanceLock(false);
      }

    })();
  }, [_promptAllowance]);

  return {
    checkAllowance,
  };
};

export default useAllowanceChecker;
