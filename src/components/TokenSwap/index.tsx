import { useContext } from "react";
import { appContext } from "../../AppContext";

import Cross from "../UI/Cross";
import SwapWidget from "../SwapWidget";
import AnimatedDialog from "../UI/AnimatedDialog";

const TokenSwap = () => {
  const { _currentNavigation, handleNavigation, swapDirection } =
    useContext(appContext);

  return (
    <AnimatedDialog
      display={_currentNavigation === "uniswap"}
      dismiss={() => handleNavigation("balance")}
    >
      <div>
        <div className="grid grid-cols-[1fr_auto] pr-4">
          <div>
            <h3 className="px-4 text-base font-bold text-center">
              {swapDirection === "wminima" && "Swap USDT for WMINIMA"}
              {swapDirection === "usdt" && "Swap WMINIMA for USDT"}
            </h3>
          </div>
          <Cross dismiss={() => handleNavigation("balance")} />
        </div>
        <div className="my-4 px-4">
          <SwapWidget />
        </div>
      </div>
    </AnimatedDialog>
  );
};

export default TokenSwap;
