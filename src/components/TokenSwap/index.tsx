import { useContext } from "react";
import { createPortal } from "react-dom";
import { useSpring, animated, config } from "react-spring";
import { appContext } from "../../AppContext";
import Dialog from "../UI/Dialog";

import Cross from "../UI/Cross";
import SwapWidget from "../SwapWidget";

const TokenSwap = () => {
  const { _currentNavigation, handleNavigation, swapDirection } =
    useContext(appContext);

  const springProps = useSpring({
    opacity: _currentNavigation === "uniswap" ? 1 : 0,
    transform:
      _currentNavigation === "uniswap"
        ? "translateY(0%) scale(1)"
        : "translateY(-50%) scale(0.8)",
    config: config.wobbly,
  });

  if (_currentNavigation !== "uniswap") {
    return null;
  }

  return (
    _currentNavigation === "uniswap" &&
    createPortal(
      <Dialog>
        <div className="h-[100vh_-_64px] grid items-start mt-[80px]">
          <animated.div style={springProps}>
            <div className=" bg-white shadow-lg  shadow-slate-300 dark:shadow-sm dark:bg-black w-[calc(100%_-_16px)] md:w-full p-4 px-0 rounded mx-auto">
              <div className="grid grid-cols-[1fr_auto] pr-4">
                <div>
                  <h3 className="px-4 text-base font-bold text-center">
                    {swapDirection === 'wminima' && "Swap USDT for WMINIMA"}
                    {swapDirection === 'usdt' && "Swap WMINIMA for USDT"}
                  </h3>
                </div>
                <Cross dismiss={() => handleNavigation("balance")} />
              </div>
              <div className="my-4 px-4">
                  <SwapWidget />                
              </div>
            </div>
          </animated.div>
        </div>
      </Dialog>,
      document.body
    )
  );
};

export default TokenSwap;
