import { useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSpring, animated, config } from "react-spring";

import styles from "./UserAccount.module.css";
import * as utils from "../../utils";
import Dialog from "../UI/Dialog";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";
import { appContext } from "../../AppContext";
import QRCode from "react-qr-code";
import WalletAddress from "../WalletAddress";
import PrivateKey from "../PrivateKey";

import { createAvatar } from "@dicebear/core";
import { notionists } from "@dicebear/collection";
import Cross from "../UI/Cross";

const UserAccount = () => {
  const [promptUserAccountDetails, setPromptUserAccountDetails] =
    useState(false);
  const [nickname, setNickname] = useState("");
  const { _wallet } = useWalletContext();
  const {
    _promptAccountNameUpdate,
    promptAccountNameUpdate,
    _addressBook,
    updateAddressBook,
  } = useContext(appContext);

  const [_promptQrCode, setPromptQrCode] = useState(false);
  const [viewKey, setViewKey] = useState(false);
  const [remainingTime, setRemainingTime] = useState(5000);
  const [held, setHeld] = useState(false);
  const timeoutRef: any = useRef(null);

  const handleChange = (e) => {
    setNickname(e.target.value);
  };

  const promptQrCode = () => {
    setPromptQrCode((prevState) => !prevState);
  };

  const handleStart = () => {
    timeoutRef.current = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timeoutRef.current);
          setHeld(true);
          setViewKey(true);
          return 0;
        }
        return prevTime - 1000;
      });
    }, 1000);
    setHeld(true);
  };

  const handleEnd = () => {
    setViewKey(false);
    clearInterval(timeoutRef.current);
    setRemainingTime(5000);
    setHeld(false);
  };

  useEffect(() => {
    if (
      _addressBook &&
      _wallet &&
      _wallet.address &&
      _addressBook[_wallet!.address]
    ) {
      setNickname(_addressBook[_wallet!.address]);
    }
  }, [_addressBook, _wallet]);

  const springProps = useSpring({
    opacity: promptUserAccountDetails ? 1 : 0,
    transform: promptUserAccountDetails
      ? "translateY(0%) scale(1)"
      : "translateY(-50%) scale(0.8)",
    config: config.gentle,
  });

  return (
    <>
      <div
        onClick={() => setPromptUserAccountDetails(true)}
        className="bg-black hover:bg-teal-300 bg-opacity-10 hover:cursor-pointer flex items-center w-max gap-2 justify-between px-1 rounded-lg text-center"
      >
        {_wallet && _wallet!.address && (
          <div className="h-full flex items-center justify-center">
            <Bear extraClass=" !h-full w-[34px]" input={_wallet!.address} />
          </div>
        )}
        <h3 className="truncate font-bold max-w-[128px] dark:text-black">
          {_wallet &&
          _addressBook[_wallet!.address] &&
          _addressBook[_wallet!.address].length
            ? _addressBook[_wallet!.address]
            : "Account"}
        </h3>
        <svg
          className="min-w-[20px] text-black"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="#000000"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path
            d="M18 9c.852 0 1.297 .986 .783 1.623l-.076 .084l-6 6a1 1 0 0 1 -1.32 .083l-.094 -.083l-6 -6l-.083 -.094l-.054 -.077l-.054 -.096l-.017 -.036l-.027 -.067l-.032 -.108l-.01 -.053l-.01 -.06l-.004 -.057v-.118l.005 -.058l.009 -.06l.01 -.052l.032 -.108l.027 -.067l.07 -.132l.065 -.09l.073 -.081l.094 -.083l.077 -.054l.096 -.054l.036 -.017l.067 -.027l.108 -.032l.053 -.01l.06 -.01l.057 -.004l12.059 -.002z"
            strokeWidth="0"
            fill="currentColor"
          />
        </svg>
      </div>

      {_wallet && _wallet.address && (
        <BiggerQrCode
          data={_wallet!.address}
          dismiss={promptQrCode}
          active={_promptQrCode}
        />
      )}

      {promptUserAccountDetails &&
        createPortal(
          <Dialog dismiss={() => setPromptUserAccountDetails(false)}>
            <div className="h-full grid items-start">
              <animated.div style={springProps}>
                <div className="bg-white shadow-lg shadow-violet-300 mt-[80px] dark:bg-black w-[calc(100%_-_16px)] md:w-full pb-8 pt-4 px-4 rounded-lg mx-auto">
                  <div className="flex justify-between items-center">
                    <Cross dismiss={() => setPromptUserAccountDetails(false)} />
                    <div>
                      {_wallet && _wallet.address && (
                        <div className="flex gap-2 items-center">
                          <div onClick={promptQrCode}>
                            <QRCode size={34} value={_wallet!.address} />
                          </div>
                          {window.navigator.userAgent.includes(
                            "Minima Browser"
                          ) && (
                            <div
                              onClick={() => {
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                Android.shareFile(_wallet!.address, "*/*");
                              }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="icon icon-tabler icon-tabler-user-share"
                                width="34"
                                height="34"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path
                                  stroke="none"
                                  d="M0 0h24v24H0z"
                                  fill="none"
                                />
                                <path d="M6 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                                <path d="M18 6m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                                <path d="M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                                <path d="M8.7 10.7l6.6 -3.4" />
                                <path d="M8.7 13.3l6.6 3.4" />
                              </svg>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    onClick={promptAccountNameUpdate}
                    className="flex items-center justify-center"
                  >
                    {_wallet && _wallet.address && (
                      <Bear
                        extraClass=" w-[160px] md:w-[220px]"
                        input={_wallet!.address}
                      />
                    )}
                  </div>
                  <div className="mx-auto">
                    {!_promptAccountNameUpdate && (
                      <div className="flex gap-1 mt-3 items-center justify-center">
                        <h3 className="font-bold max-w-[128px] dark:text-teal-300 md:text-xl truncate">
                          {_addressBook[_wallet!.address] &&
                          _addressBook[_wallet!.address].length
                            ? _addressBook[_wallet!.address]
                            : "MiniGhost"}
                        </h3>

                        <svg
                          onClick={promptAccountNameUpdate}
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          strokeWidth="3.5"
                          stroke="currentColor"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                          <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                          <path d="M13.5 6.5l4 4" />
                        </svg>
                      </div>
                    )}
                    {_promptAccountNameUpdate && (
                      <div
                        className={`${styles["tokens"]} flex justify-center items-center`}
                      >
                        <input
                          value={nickname}
                          onChange={handleChange}
                          placeholder="Enter nickname"
                        />
                        <svg
                          onClick={() =>
                            updateAddressBook(
                              _wallet!.address,
                              utils.sanitizeSQLInput(nickname)
                            )
                          }
                          xmlns="http://www.w3.org/2000/svg"
                          width="44"
                          height="44"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="#4FE3C1"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                          <path
                            d="M12 2c-.218 0 -.432 .002 -.642 .005l-.616 .017l-.299 .013l-.579 .034l-.553 .046c-4.785 .464 -6.732 2.411 -7.196 7.196l-.046 .553l-.034 .579c-.005 .098 -.01 .198 -.013 .299l-.017 .616l-.004 .318l-.001 .324c0 .218 .002 .432 .005 .642l.017 .616l.013 .299l.034 .579l.046 .553c.464 4.785 2.411 6.732 7.196 7.196l.553 .046l.579 .034c.098 .005 .198 .01 .299 .013l.616 .017l.642 .005l.642 -.005l.616 -.017l.299 -.013l.579 -.034l.553 -.046c4.785 -.464 6.732 -2.411 7.196 -7.196l.046 -.553l.034 -.579c.005 -.098 .01 -.198 .013 -.299l.017 -.616l.005 -.642l-.005 -.642l-.017 -.616l-.013 -.299l-.034 -.579l-.046 -.553c-.464 -4.785 -2.411 -6.732 -7.196 -7.196l-.553 -.046l-.579 -.034a28.058 28.058 0 0 0 -.299 -.013l-.616 -.017l-.318 -.004l-.324 -.001zm2.293 7.293a1 1 0 0 1 1.497 1.32l-.083 .094l-4 4a1 1 0 0 1 -1.32 .083l-.094 -.083l-2 -2a1 1 0 0 1 1.32 -1.497l.094 .083l1.293 1.292l3.293 -3.292z"
                            fill="#4FE3C1"
                            strokeWidth="0"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="w-max mx-auto my-4">
                    {!viewKey && <WalletAddress fullAddress />}
                    {!viewKey && (
                      <button
                        onMouseDown={handleStart}
                        onMouseUp={handleEnd}
                        onMouseLeave={handleEnd}
                        onTouchStart={handleStart}
                        onTouchEnd={handleEnd}
                        className="mt-2 font-bold w-full rounded-lg text-white bg-purple-500"
                      >
                        {held
                          ? `Hold to reveal... (${Math.ceil(
                              remainingTime / 1000
                            )}s)`
                          : `View private key`}
                      </button>
                    )}
                    {viewKey && (
                      <div className="my-2">
                        <PrivateKey fullAddress />
                        <div
                          className="max-w-xs my-2 mx-auto bg-red-700 border border-red-800 text-red-100 px-4 py-3 rounded relative"
                          role="alert"
                        >
                          <strong className="font-bold mr-1">Warning</strong>
                          <span className="block sm:inline">
                            Never share your private key with anyone! Doing so
                            could result in the loss of your funds.
                          </span>
                        </div>
                        <button
                          onClick={() => handleEnd()}
                          className="w-full bg-violet-500 text-white font-bold"
                        >
                          Done
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </animated.div>
            </div>
          </Dialog>,
          document.body
        )}
    </>
  );
};

export default UserAccount;

interface BearProps {
  input: string;
  extraClass?: string;
}

const Bear = ({ input, extraClass }: BearProps) => {
  const avatar = createAvatar(notionists, {
    seed: input,
    // ... other options
  });

  const svg = avatar.toDataUriSync();

  return (
    <div className="rounded-full bg-teal-300">
      <img className={`${extraClass && extraClass}`} src={svg} />
    </div>
  );
};

interface QrProps {
  active: boolean;
  dismiss: () => void;
  data: string;
}
const BiggerQrCode = ({ data, active, dismiss }: QrProps) => {
  const springProps = useSpring({
    opacity: active ? 1 : 0,
    transform: active
      ? "translateY(0%) scale(1)"
      : "translateY(-50%) scale(0.8)",
    config: config.wobbly,
  });
  if (!active) {
    return null;
  }

  return (
    <>
      {active &&
        createPortal(
          <Dialog extraClass="z-[26]" dismiss={dismiss}>
            <div className="h-full grid items-start">
              <animated.div style={springProps}>
                <div className=" shadow-violet-300 mt-[80px] w-[calc(100%_-_16px)] md:w-full pb-8 pt-4 px-4 rounded-lg mx-auto">
                  <div className=" flex justify-center items-center mx-auto gap-4 flex-col max-w-xs">
                    <QRCode size={300} value={data} />
                    <button
                      onClick={dismiss}
                      className="w-full bg-black text-white dark:bg-white dark:text-black shadow-lg font-bold py-4"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </animated.div>
            </div>
          </Dialog>,
          document.body
        )}
    </>
  );
};
