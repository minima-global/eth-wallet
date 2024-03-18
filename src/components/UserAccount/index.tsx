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

  const [viewKey, setViewKey] = useState(false);
  const [remainingTime, setRemainingTime] = useState(5000);
  const [held, setHeld] = useState(false);
  const timeoutRef: any = useRef(null);

  const handleChange = (e) => {
    setNickname(e.target.value);
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
        className="bg-white hover:cursor-pointer hover:bg-opacity-80 flex items-center w-max gap-2 justify-between bg-opacity-90 px-4 py-2 pr-2 rounded-lg text-center"
      >
        {_wallet && _wallet!.address && (
          <Bear extraClass="!w-[24px]" input={_wallet!.address} />
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

      {promptUserAccountDetails &&
        createPortal(
          <Dialog dismiss={() => setPromptUserAccountDetails(false)}>
            <div className="h-full grid items-start">
              <animated.div style={springProps}>
                <div className="bg-white shadow-lg shadow-violet-300 mt-[80px] dark:bg-black w-[calc(100%_-_16px)] md:w-full py-8 px-4 rounded-lg mx-auto">
                  <div className="grid grid-cols-[1fr_auto]">
                    <div className="mx-auto">
                      <Bear input={_wallet!.address} />
                    </div>
                    <Cross dismiss={() => setPromptUserAccountDetails(false)} />
                  </div>
                  <div className="mx-auto">
                    {!_promptAccountNameUpdate && (
                      <div className="flex gap-1 items-center justify-center">
                        <h3 className="font-bold max-w-[128px] truncate">
                          {_addressBook[_wallet!.address] &&
                          _addressBook[_wallet!.address].length
                            ? _addressBook[_wallet!.address]
                            : "Account"}
                        </h3>
                        <svg
                          onClick={promptAccountNameUpdate}
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          strokeWidth="2.5"
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
                  <div className="mt-4 flex justify-center items-center">
                    {_wallet && <QRCode size={200} value={_wallet!.address} />}
                  </div>
                  <div className="w-max mx-auto my-4">
                    <WalletAddress fullAddress />
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
                          ? `Revealing... (${Math.ceil(remainingTime / 1000)}s)`
                          : `View private key`}
                      </button>
                    )}
                    {viewKey && (
                      <div className="my-2">
                        <PrivateKey fullAddress />
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
    <div className="mb-1 rounded-full bg-teal-300">
      <img className={`w-[56px] ${extraClass && extraClass}`} src={svg} />
    </div>
  );
};
