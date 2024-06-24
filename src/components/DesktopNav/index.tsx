import { useContext } from "react";
import { appContext } from "../../AppContext";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";
import { etherscan } from "../../constants";
import NavigationButton from "../UI/NavigationButton";
import SendIcon from "../UI/Icons/SendIcon";
import SwapIcon from "../UI/Icons/SwapIcon";
import HistoryIcon from "../UI/Icons/HistoryIcon";

const DesktopNav = () => {
  const { _currentNavigation, handleNavigation } = useContext(appContext);
  const { _address, _network } = useWalletContext();

  return (
    <section>
      <nav className="grid-cols-3 gap-2 grid-rows-[58px] hidden sm:grid">        
        <NavigationButton title="Send" icon={<SendIcon />} onClick={() => handleNavigation("send")} active={_currentNavigation==='send'} />
        <NavigationButton title="Swap" icon={<SwapIcon />} onClick={() => handleNavigation("uniswap")} active={_currentNavigation==='uniswap'} />
        <NavigationButton title="History" icon={<HistoryIcon />} onClick={(e) => {
          if (window.navigator.userAgent.includes("Minima Browser")) {
            e.preventDefault();
            // @ts-ignore
            Android.openExternalBrowser(`${etherscan[_network].rpc}${_address}`, "_blank");
          }

          window.open(`${etherscan[_network].rpc}${_address}`, "_blank")}} active={false} />
      </nav>
    </section>
  );
};

export default DesktopNav;
