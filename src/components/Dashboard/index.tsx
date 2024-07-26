import { useContext } from "react";
import styles from "./Dashboard.module.css";
import DesktopNav from "../DesktopNav";
import { appContext } from "../../AppContext";


import Send from "../Send";
import UserAccount from "../UserAccount";
import TokenList from "../TokenList";
import Activity from "../Activities";
import Settings from "../Settings";
import { etherscan } from "../../constants";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";
import ReadMode from "../ReadMode";
import AppLoading from "../AppLoading";
import TokenDetails from "../TokenList/TokenDetails";
import TokenSwap from "../TokenSwap";
import DatabaseLocked from "../DatabaseLocked";
import NavigationButton from "../UI/NavigationButton";
import HistoryIcon from "../UI/Icons/HistoryIcon";
import SendIcon from "../UI/Icons/SendIcon";
import SwapIcon from "../UI/Icons/SwapIcon";
import AppThemeSwitch from "../AppThemeSwitch";
import useLedger from "../../hooks/useLedger";

const Dashboard = () => {
  const { _network, _address } = useWalletContext();
  const {
    _currentNavigation,
    handleNavigation,
    promptSettings,
  } = useContext(appContext);

  useLedger();

  return (
    <>
      <div className={styles["grid"]}>
        <header
          onClick={() => {
            if (window.navigator.userAgent.includes("Minima Browser")) {
              // @ts-ignore
              Android.showTitleBar();
            }
          }}
          className="!grid grid-cols-[1fr_1fr_1fr] gap-2 md:grid-cols-[1fr_minmax(0,_360px)_1fr]"
        >
          <div>
            <svg
              width="48"
              height="46"
              className="rounded-lg"
              viewBox="0 0 512 512"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="512" height="512" fill="white" />
              <g clipPath="url(#clip0_2017_33)">
                <path
                  d="M255.969 85.5L253.697 93.2709V318.745L255.969 321.028L359.936 259.162L255.969 85.5Z"
                  fill="#343434"
                />
                <path
                  d="M255.97 85.5L152 259.162L255.97 321.028V211.589V85.5Z"
                  fill="#8C8C8C"
                />
                <path
                  d="M255.969 340.844L254.688 342.416V422.733L255.969 426.497L360 279.01L255.969 340.844Z"
                  fill="#3C3C3B"
                />
                <path
                  d="M255.97 426.497V340.844L152 279.01L255.97 426.497Z"
                  fill="#8C8C8C"
                />
                <path
                  d="M255.97 321.028L359.937 259.162L255.97 211.589V321.028Z"
                  fill="#141414"
                />
                <path
                  d="M152 259.162L255.97 321.028V211.589L152 259.162Z"
                  fill="#393939"
                />
              </g>
              <defs>
                <clipPath id="clip0_2017_33">
                  <rect
                    width="208"
                    height="341"
                    fill="white"
                    transform="translate(152 85.5)"
                  />
                </clipPath>
              </defs>
            </svg>
          </div>

          <div className="flex md:hidden">
            {/* <div className="mb-auto">
              <p className="text-center text-xs tracking-tighter font-bold  text-yellow-100  shadow-sm shadow-yellow-300 max-w-max mx-auto px-4">
                TESTING PURPOSE ONLY
              </p>
            </div> */}
          </div>
          <div
            onClick={(e) => e.stopPropagation()}
            className="justify-center items-center hidden md:flex flex-col gap-2"
          >
            <div className="mb-auto">
              {/* <p className="text-center text-xs tracking-tighter font-bold text-yellow-100  shadow-sm dark:shadow-yellow-300 max-w-max mx-auto px-4">
                TESTING PURPOSE ONLY
              </p> */}
            </div>
            <UserAccount />
          </div>
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex justify-end gap-2"
          >
            <div className="flex md:hidden">
              <UserAccount />
            </div>
            <div className="flex items-center">
              <AppThemeSwitch />
              
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center"
              >
                <svg
                  onClick={promptSettings}
                  className="hover:cursor-pointer hover:animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="#000000"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path
                    className="fill-white dark:fill-black dark:opacity-80"
                    d="M14.647 4.081a.724 .724 0 0 0 1.08 .448c2.439 -1.485 5.23 1.305 3.745 3.744a.724 .724 0 0 0 .447 1.08c2.775 .673 2.775 4.62 0 5.294a.724 .724 0 0 0 -.448 1.08c1.485 2.439 -1.305 5.23 -3.744 3.745a.724 .724 0 0 0 -1.08 .447c-.673 2.775 -4.62 2.775 -5.294 0a.724 .724 0 0 0 -1.08 -.448c-2.439 1.485 -5.23 -1.305 -3.745 -3.744a.724 .724 0 0 0 -.447 -1.08c-2.775 -.673 -2.775 -4.62 0 -5.294a.724 .724 0 0 0 .448 -1.08c-1.485 -2.439 1.305 -5.23 3.744 -3.745a.722 .722 0 0 0 1.08 -.447c.673 -2.775 4.62 -2.775 5.294 0zm-2.647 4.919a3 3 0 1 0 0 6a3 3 0 0 0 0 -6z"
                    strokeWidth="0"
                    fill="currentColor"
                  />
                </svg>
              </div>
            
            </div>
          </div>
        </header>
        <main>
          <section>
            <section />
            <TokenSwap />
            <TokenDetails />
            <AppLoading />
            <Settings />
            <ReadMode />
            <DatabaseLocked />
            <Send />
            <DesktopNav />
            <TokenList />
            <Activity />
          </section>
        </main>
        <footer>
          <nav className="grid grid-cols-3 sm:hidden py-2">
            <NavigationButton
              footer
              title="Send"
              icon={<SendIcon />}
              onClick={() => handleNavigation("send")}
              active={_currentNavigation === "send"}
            />
            <NavigationButton
              footer
              title="Swap"
              icon={<SwapIcon />}
              onClick={() => handleNavigation("uniswap")}
              active={_currentNavigation === "uniswap"}
            />
            <NavigationButton
              footer
              title="History"
              icon={<HistoryIcon />}
              onClick={(e) => {
                if (window.navigator.userAgent.includes("Minima Browser")) {
                  e.preventDefault();
                  // @ts-ignore
                  Android.openExternalBrowser(
                    `${etherscan[_network].rpc}${_address}`,
                    "_blank"
                  );
                }

                window.open(`${etherscan[_network].rpc}${_address}`, "_blank");
              }}
              active={false}
            />
          </nav>
        </footer>
      </div>
    </>
  );
};

export default Dashboard;
