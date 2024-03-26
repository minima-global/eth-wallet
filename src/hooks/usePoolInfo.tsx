import { useEffect, useState } from "react";
import { useWalletContext } from "../providers/WalletProvider/WalletProvider";

const usePoolInfo = () => {
  const { _poolContract } = useWalletContext();
  const [poolInfo, setPoolInfo] = useState<any>(null); // Initialize poolInfo with null

  useEffect(() => {
    if (!_poolContract) return;

    const fetchPoolInfo = async () => {
      try {
        // Fetch pool information from the pool contract
        const [fee, tickSpacing, liquidity, slot0] =
        await Promise.all([
          _poolContract.fee(),
          _poolContract.tickSpacing(),
          _poolContract.liquidity(),
          _poolContract.slot0(),
        ])

        console.log({
          fee,
          tickSpacing,
          liquidity,
          sqrtPriceX96: slot0[0],
          tick: slot0[1],
        })
        // Update the state with the fetched pool information
        setPoolInfo({
          fee,
          tickSpacing,
          liquidity,
          sqrtPriceX96: slot0[0],
          tick: slot0[1],
        });
      } catch (error) {
        console.error("Error fetching pool information:", error);
      }
    };

    // Call the fetchPoolInfo function
    fetchPoolInfo();
  }, []); // Add poolContract as a dependency for the effect

  return poolInfo; // Return the pool information
};

export default usePoolInfo;
