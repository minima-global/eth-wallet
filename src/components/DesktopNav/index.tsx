import { useContext } from "react";
import { appContext } from "../../AppContext";
import NavigationButton from "../UI/NavigationButton";
import SendIcon from "../UI/Icons/SendIcon";
import SwapIcon from "../UI/Icons/SwapIcon";
import HistoryIcon from "../UI/Icons/HistoryIcon";

const DesktopNav = () => {
  const { _currentNavigation, handleNavigation } = useContext(appContext);

  return (
    <section>
      <nav className="grid-cols-3 gap-2 grid-rows-[58px] hidden sm:grid">        
        <NavigationButton title="Send" icon={<SendIcon />} onClick={() => handleNavigation("send")} active={_currentNavigation==='send'} />
        <NavigationButton title="Swap" icon={<SwapIcon />} onClick={() => handleNavigation("uniswap")} active={_currentNavigation==='uniswap'} />
        <NavigationButton title="History" icon={<HistoryIcon />} onClick={() => handleNavigation("history")} active={false} />
      </nav>
    </section>
  );
};

export default DesktopNav;
