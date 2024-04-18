import { useContext, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./Dashboard.module.css";
import DesktopNav from "../DesktopNav";
import { appContext } from "../../AppContext";
import Dialog from "../UI/Dialog";

import * as utils from "../../utils";
import { useSpring, animated, config } from "react-spring";
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

const Dashboard = () => {
  const { _network, _address } = useWalletContext();
  const {
    promptLogout,
    loginForm,
    _currentNavigation,
    handleNavigation,
    _promptLogoutDialog,
    promptLogoutDialog,
    promptSettings,
  } = useContext(appContext);

  const [password, setPassword] = useState<"text" | "password">("password");
  const [copied, setCopied] = useState(false);

  const handleToggleVisibility = () => {
    setPassword((prevState) =>
      prevState === "password" ? "text" : "password"
    );
  };

  const handleCopy = () => {
    setCopied(true);
    utils.copyToClipboard(loginForm._seedPhrase);
  };

  const springProps = useSpring({
    opacity: _promptLogoutDialog ? 1 : 0,
    transform: _promptLogoutDialog
      ? "translateY(0%) scale(1)"
      : "translateY(-50%) scale(0.8)",
    config: config.stiff,
  });

  return (
    <>
      {_promptLogoutDialog &&
        createPortal(
          <Dialog>
            <animated.div
              style={springProps}
              className="h-full grid items-center"
            >
              <div className="z-[1000] bg-white rounded-lg mx-4 md:mx-0 min-h-[40vh] p-4  text-left grid grid-cols-1 grid-rows-[auto_1fr] shadow-xl">
                <div className="grid grid-cols-[auto_1fr] gap-2 items-center">
                  <h1 className="text-2xl text-black dark:text-black font-bold">
                    Are you sure you want to log out?
                  </h1>
                </div>
                <div>
                  <h1 className="text-black text-xl mt-4 mb-2 pb-0">
                    If you haven't stored your secret code then this is your
                    last chance!
                  </h1>
                  <label className="grid gap-1 relative">
                    <input
                      readOnly
                      autoComplete="off"
                      value={loginForm._seedPhrase}
                      type={password}
                      placeholder="Secret code"
                      className="bg-slate-200 text-black p-3 rounded-lg focus:bg-white focus:text-black hover:bg-white hover:outline-black focus:outline hover:outline shadow-xl"
                    />
                    <button
                      className="absolute text-teal-500 right-3 top-3 active:outline-none !border-none focus:border-none hover:border-none focus:outline-none p-0"
                      onClick={handleToggleVisibility}
                    >
                      {password === "password" && (
                        <svg
                          className="text-black"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                          <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                          <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />
                        </svg>
                      )}

                      {password === "text" && (
                        <svg
                          className="text-black"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                          <path d="M10.585 10.587a2 2 0 0 0 2.829 2.828" />
                          <path d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87" />
                          <path d="M3 3l18 18" />
                        </svg>
                      )}
                    </button>
                  </label>
                  <button
                    type="button"
                    onClick={handleCopy}
                    style={{
                      appearance: "none",
                      padding: 8,
                      border: 0,
                      outline: 0,
                      cursor: "pointer",
                    }}
                    className={`${
                      copied
                        ? "outline-2 outline-offset-2 shadow-2xl outline-red-500 "
                        : ""
                    } relative items-center w-full mt-4 mx-auto font-bold text-black bg-teal-300 max-w-[200px] flex justify-between dark:text-black`}
                  >
                    {!copied ? "Copy" : "Copied"}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="28"
                      viewBox="0 -960 960 960"
                      width="28"
                      style={{
                        color: "#0809ab",
                        position: "relative",
                        top: 0,
                        right: 0,
                        strokeDasharray: 50,
                        strokeDashoffset: copied ? -50 : 0,
                        transition: "all 300ms ease-in-out",
                        opacity: copied ? 0 : 1,
                      }}
                    >
                      <path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z" />
                    </svg>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      style={{
                        color: "black",
                        position: "absolute",
                        top: 12,
                        right: 10,
                        strokeDasharray: 50,
                        strokeDashoffset: copied ? 0 : -50,
                        transition: "all 300ms ease-in-out",
                      }}
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M5 12l5 5l10 -10" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center justify-end mt-4">
                  <button
                    onClick={promptLogoutDialog}
                    className="bg-transparent outline text-black  font-bold h-max mr-2"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => {
                      setPassword("password");
                      promptLogout();
                    }}
                    className="bg-[#FFA010] text-white  font-bold h-max"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </animated.div>
          </Dialog>,

          document.body
        )}

      <div className={styles["grid"]}>
        <header
          onClick={() => {
            if (window.navigator.userAgent.includes("Minima Browser")) {
              // @ts-ignore
              Android.showTitleBar();
            }
          }}
          className="!grid grid-cols-[1fr_1fr] md:grid-cols-[1fr_minmax(0,_360px)_1fr]"
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
          <div
            onClick={(e) => e.stopPropagation()}
            className="justify-center items-center hidden md:flex"
          >
            <UserAccount />
          </div>
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex justify-end gap-2"
          >
            <div className="flex md:hidden">
              <UserAccount />
            </div>
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
        </header>
        <main>
          <section>
            <section />
            <TokenSwap />
            <TokenDetails />
            <AppLoading />
            <Settings />
            <ReadMode />
            <Send />
            <DesktopNav />
            <TokenList />
            <Activity />
          </section>
        </main>
        <footer>
          <nav className="grid grid-cols-4">
            <button
              className={` flex flex-col items-center justify-center gap-1 transition-all delay-100 duration-100 font-bold ${
                _currentNavigation === "balance" ? "bg-opacity-50" : ""
              }`}
              disabled={_currentNavigation === "balance"}
              onClick={() => handleNavigation("balance")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`${
                  _currentNavigation === "balance"
                    ? "text-white fill-teal-400 font-extrabold transition-all delay-100 duration-100"
                    : ""
                }`}
                width="24"
                height="24"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M17 8v-3a1 1 0 0 0 -1 -1h-10a2 2 0 0 0 0 4h12a1 1 0 0 1 1 1v3m0 4v3a1 1 0 0 1 -1 1h-12a2 2 0 0 1 -2 -2v-12" />
                <path d="M20 12v4h-4a2 2 0 0 1 0 -4h4" />
              </svg>
              <p
                className={`${
                  _currentNavigation === "balance"
                    ? "text-teal-500 font-extrabold transition-all delay-200 duration-100"
                    : ""
                }`}
              >
                Balance
              </p>
            </button>
            <button
              className={`flex flex-col items-center justify-center gap-1 transition-all delay-100 duration-100 font-bold ${
                _currentNavigation === "send" ? "bg-opacity-50 " : ""
              }`}
              disabled={_currentNavigation === "send"}
              onClick={() => handleNavigation("send")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`${
                  _currentNavigation === "send"
                    ? "text-white fill-teal-400 font-extrabold transition-all delay-100 duration-100"
                    : ""
                }`}
                width="24"
                height="24"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M10 14l11 -11" />
                <path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5" />
              </svg>
              <p
                className={`${
                  _currentNavigation === "send"
                    ? "text-teal-500 font-extrabold transition-all delay-200 duration-100"
                    : ""
                }`}
              >
                Send
              </p>
            </button>
            <button
              className={` flex flex-col items-center justify-center gap-1 transition-all delay-100 duration-100 font-bold ${
                _currentNavigation === "receive" ? "bg-opacity-50 " : ""
              }`}
              disabled={_currentNavigation === "receive"}
              onClick={() =>
                window.open(`${etherscan[_network].rpc}${_address}`)
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`${
                  _currentNavigation === "uniswap"
                    ? "text-white fill-teal-400 font-extrabold transition-all delay-100 duration-100"
                    : ""
                }`}
                width="24"
                height="24"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M20 10h-16l5.5 -6" />
                <path d="M4 14h16l-5.5 6" />
              </svg>
              <p
                className={`${
                  _currentNavigation === "receive"
                    ? "text-teal-500 font-extrabold transition-all delay-200 duration-100"
                    : ""
                }`}
              >
                Swap
              </p>
            </button>
            <button
              className={` flex flex-col items-center justify-center gap-1 transition-all delay-100 duration-100 font-bold ${
                _currentNavigation === "receive" ? "bg-opacity-50 " : ""
              }`}
              disabled={_currentNavigation === "receive"}
              onClick={() =>
                window.open(`${etherscan[_network].rpc}${_address}`)
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`${
                  _currentNavigation === "activity"
                    ? "text-white fill-teal-400 font-extrabold transition-all delay-100 duration-100"
                    : ""
                }`}
                width="24"
                height="24"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M3 12h4l3 8l4 -16l3 8h4" />
              </svg>
              <p
                className={`${
                  _currentNavigation === "receive"
                    ? "text-teal-500 font-extrabold transition-all delay-200 duration-100"
                    : ""
                }`}
              >
                History
              </p>
            </button>
          </nav>
        </footer>
      </div>
    </>
  );
};

export default Dashboard;
