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
import Cross from "../UI/Cross";
import Profile from "../UI/Profile";
import AnimatedDialog from "../UI/AnimatedDialog";
import Account from "./Account";
import { Formik } from "formik";
import BackIcon from "../UI/Icons/BackIcon";
import { Wallet } from "ethers";
import useLedger from "../../hooks/useLedger";

const UserAccount = () => {
  const [promptUserAccountDetails, setPromptUserAccountDetails] =
    useState(false);
  const [promptAccounts, setPromptAccounts] = useState(false);
  const [promptAddAccount, setPromptAddAccount] = useState(false);

  // ledger
  const {connectLedgerAndGetAccounts, chooseAccount, addSelectedAccount, disconnectLedger, connected} = useLedger();

  const [accounts, setAccounts] = useState<any>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<any>([]);

  const handleConnectLedger = async () => {
    const fetchedAccounts = await connectLedgerAndGetAccounts();
    if (fetchedAccounts) {
      setAccounts(fetchedAccounts);
    }
  };

  const handleAccountSelection = (account) => {
    setSelectedAccounts(prevSelectedAccounts => {
      if (prevSelectedAccounts.includes(account)) {
        // Remove the account if it's already selected (deselect)
        return prevSelectedAccounts.filter(acc => acc !== account);
      } else {
        // Add the account to the selected list
        return [...prevSelectedAccounts, account];
      }
    });
  };

  const [error, setError] = useState<{ import?: string; ledger?: string } | false>(false);
  const [viewPrivateKey, setViewPrivateKey] = useState(false);
  const [importType, setImportType] = useState<"account" | "ledger" | null>(
    null
  );

  const [nickname, setNickname] = useState("");
  const { _address } = useWalletContext();
  const {
    _promptAccountNameUpdate,
    promptAccountNameUpdate,
    _addressBook,
    updateAddressBook,
    _userAccounts,
    addUserAccount
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
    if (_addressBook && _address && _address && _addressBook[_address]) {
      setNickname(_addressBook[_address]);
    }
  }, [_addressBook, _address]);

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
        {_address && (
          <div className="h-full flex items-center justify-center">
            <Profile
              extraClass=" !h-full w-[34px] min-w-[34px]"
              input={_address}
            />
          </div>
        )}
        <h3 className="truncate font-bold max-w-[128px] dark:text-black">
          {_address && _addressBook[_address] && _addressBook[_address].length
            ? _addressBook[_address]
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

      {_address && (
        <BiggerQrCode
          data={_address}
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
                      {_address && (
                        <div className="flex gap-2 items-center">
                          <div onClick={promptQrCode}>
                            <QRCode size={34} value={_address} />
                          </div>
                          {window.navigator.userAgent.includes(
                            "Minima Browser"
                          ) && (
                            <div
                              onClick={() => {
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                Android.shareText(_address);
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
                    {_address && (
                      <Profile
                        extraClass=" w-[160px] md:w-[220px]"
                        input={_address}
                      />
                    )}
                  </div>
                  <div className="mx-auto">
                    {!_promptAccountNameUpdate && (
                      <div className="flex gap-1 mt-3 items-center justify-center">
                        <h3 className="font-bold max-w-[128px] dark:text-teal-300 md:text-xl truncate">
                          {_addressBook[_address!] &&
                          _addressBook[_address!].length
                            ? _addressBook[_address!]
                            : "Minimalist"}
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
                              _address,
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

                    <div className="mt-6">
                      <button
                        onClick={() => setPromptAccounts(true)}
                        type="button"
                        className="w-full full-rounded border border-neutral-200 hover:border-neutral-500 bg-transparent dark:text-neutral-100 font-bold"
                      >
                        {!!_userAccounts.length &&
                          _userAccounts.find((account) => account.current) && _userAccounts.find((account) => account.current).nickname
                          }
                      </button>
                    </div>
                  </div>
                </div>
              </animated.div>
            </div>
          </Dialog>,
          document.body
        )}

      <AnimatedDialog
        display={promptAccounts}
        dismiss={() => setPromptAccounts(false)}
      >
        <div>
          <div className="max-w-lg mx-4 sm:mx-auto">
            <div className="w-full rounded-lg bg-white dark:bg-[#1B1B1B] shadow-md dark:shadow-none py-8 text-left">
              <div className="flex justify-between items-center px-6">
                {!promptAddAccount && (
                  <h2 className="text-xl font-bold dark:text-neutral-400">
                    User Accounts
                  </h2>
                )}
                {promptAddAccount && (
                  <div className="flex items-center gap-2">
                    <span
                      className=" dark:text-neutral-600"
                      onClick={() => {
                        if (importType) {
                          return setImportType(null);
                        }

                        setPromptAddAccount(false);
                      }}
                    >
                      <BackIcon fill="currentColor" />
                    </span>

                    <h2 className="text-xl font-bold dark:text-neutral-400">
                      Manage Accounts
                    </h2>
                  </div>
                )}

                <button
                  onClick={() => setPromptAccounts(false)}
                  className="text-purple-500 hover:text-purple-700"
                >
                  Close
                </button>
              </div>
              {promptAddAccount ? (
                <div className="mt-8 mb-24">
                  {!importType && (
                    <div className="grid sm:grid-cols-2 gap-4 mx-8">
                      <button
                        onClick={() => setImportType("account")}
                        type="button"
                        className="sm:max-w-sm full-rounded border border-neutral-200 hover:border-neutral-500 bg-transparent dark:text-neutral-100 dark:border-neutral-500 hover:dark:border-neutral-400 font-bold"
                      >
                        Import Account
                      </button>
                      <button
                        onClick={() => setImportType("ledger")}
                        type="button"
                        className="sm:max-w-sm full-rounded border border-neutral-200 hover:border-neutral-500 bg-transparent dark:text-neutral-100 dark:border-neutral-500 hover:dark:border-neutral-400 font-bold"
                      >
                        Import Ledger Wallet
                      </button>
                    </div>
                  )}

                  {importType === "account" && (
                    <Formik
                      initialValues={{ nickname: "", privatekey: "" }}
                      onSubmit={async ({nickname, privatekey}) => {
                        try {
                          // Set up the a/c

                          const accountAddress = new Wallet(privatekey);
                          
                          await addUserAccount({nickname, address: accountAddress.address, privatekey, current: false, type: 'normal'});                        
                          console.log('ADDED!');
                        } catch (err) {
                          if (err instanceof Error) {
                            setError((prevState) => prevState ? ({
                              ...prevState,
                              import: err.message,
                            }) : {import: err.message});
                          } else {
                            setError((prevState) => prevState ? ({
                              ...prevState,
                              import: "Invalid Account",
                            }) : {import: "Invalid Account"});
                          }
                        }
                      }}
                    >
                      {({ handleSubmit, getFieldProps }) => (
                        <form onSubmit={handleSubmit}>
                          <p className="mx-6 text-black dark:text-neutral-500 font-bold">
                            Import Private Key
                          </p>

                          <div className="space-y-4 pt-4">
                            <div className="flex flex-col px-6">
                              <label
                                htmlFor="nickname"
                                className="px-4 text-sm pb-1 dark:text-neutral-500"
                              >
                                Account Name
                              </label>
                              <input
                                type="text"
                                id="nickname"
                                {...getFieldProps("nickname")}
                                placeholder="Account Name"
                                className="w-full p-4 rounded text-white dark:text-neutral-100 dark:placeholder:text-neutral-600 focus:outline-neutral-500 dark:focus:outline-neutral-800"
                              />
                            </div>
                            <div className="flex flex-col px-6">
                              <label
                                htmlFor="privatekey"
                                className="px-4 text-sm pb-1 dark:text-neutral-500"
                              >
                                Private Key
                              </label>
                              <input
                                type={viewPrivateKey ? "text" : "password"}
                                id="privatekey"
                                {...getFieldProps("privatekey")}
                                placeholder="Private Key"
                                className="w-full p-4 rounded text-white dark:text-neutral-100 dark:placeholder:text-neutral-600 focus:outline-neutral-500 dark:focus:outline-neutral-800"
                              />
                            </div>
                          </div>

                          <div className="mx-6 mt-8">
                            <button
                              type="submit"
                              className="w-full full-rounded border border-neutral-200 hover:border-neutral-500 bg-transparent dark:text-neutral-100 dark:border-neutral-500 hover:dark:border-neutral-400 font-bold"
                            >
                              Import Account
                            </button>
                          </div>
                        </form>
                      )}
                    </Formik>
                  )}
                  {importType === "ledger" && <Formik
                      initialValues={{ selectedAccounts: [] as any[] }}
                      onSubmit={async ({selectedAccounts}) => {
                        console.log(selectedAccounts);
                        try {
                          return;
                          // Iterate over each selected account and add it with the type 'ledger'
                          for (const account of selectedAccounts) {
                            await addUserAccount({
                              nickname: account.nickname || `Ledger Account ${account.index + 1}`, // Use nickname or a default name
                              address: account.address,
                              privatekey: undefined, // Ledger accounts won't have a private key stored
                              current: false,
                              type: 'ledger'
                              
                            });
                          }
                          console.log('All accounts added!');
                        } catch (err) {
                          if (err instanceof Error) {
                            setError((prevState) =>
                              prevState
                                ? {
                                    ...prevState,
                                    ledger: err.message,
                                  }
                                : { ledger: err.message }
                            );
                          } else {
                            setError((prevState) =>
                              prevState
                                ? {
                                    ...prevState,
                                    ledger: "Invalid Account",
                                  }
                                : { ledger: "Invalid Account" }
                            );
                          }
                        }
                      }}
                    >
                      {({ values, handleSubmit, resetForm, setFieldValue }) => (
                        <form onSubmit={handleSubmit}>
                          <p className="mx-6 text-black dark:text-neutral-500 font-bold">
                            Import Ledger Account(s)
                          </p>

                          <div className="space-y-4 pt-4">
                            {/* <div className="flex flex-col px-6">
                              <label
                                htmlFor="nickname"
                                className="px-4 text-sm pb-1 dark:text-neutral-500"
                              >
                                Account Name
                              </label>
                              <input
                                type="text"
                                id="nickname"
                                {...getFieldProps("nickname")}
                                placeholder="Account Name"
                                className="w-full p-4 rounded text-white dark:text-neutral-100 dark:placeholder:text-neutral-600 focus:outline-neutral-500 dark:focus:outline-neutral-800"
                              />
                            </div>
                            <div className="flex flex-col px-6">
                              <label
                                htmlFor="privatekey"
                                className="px-4 text-sm pb-1 dark:text-neutral-500"
                              >
                                Private Key
                              </label>
                              <input
                                type={viewPrivateKey ? "text" : "password"}
                                id="privatekey"
                                {...getFieldProps("privatekey")}
                                placeholder="Private Key"
                                className="w-full p-4 rounded text-white dark:text-neutral-100 dark:placeholder:text-neutral-600 focus:outline-neutral-500 dark:focus:outline-neutral-800"
                              />
                            </div> */}
                            
                            <div className="space-y-4">
                            <div className="px-6 space-y-3">
                              <p>Make sure your ledger is connected via USB and you have unlocked it and opened the Ethereum Application.</p>
                              <button type="button" onClick={!connected ? handleConnectLedger : () => {
                                disconnectLedger();
                                if (values.selectedAccounts.length) {
                                  resetForm();
                                }
                              }} className="full-rounded border border-neutral-200 hover:border-neutral-500 bg-transparent dark:text-neutral-100 dark:border-neutral-500 hover:dark:border-neutral-400 font-bold">{connected ? "Disconnect Ledger" : "Connect Ledger"}</button>
                            </div>
                            
                            {connected === null && <p className="px-6 text-sm text-neutral-600 dark:text-neutral-500">Ready to connect</p>}
                            {connected === false && <p className="px-6 text-sm text-neutral-600 dark:text-neutral-500">Failed to connect, make sure you followed the instructions above and re-try connection.</p>}

                            {!!connected && <>
                            <h3 className="font-bold px-6">Select an Ethereum Account:</h3>
                            <ul className="space-y-2">
                              {accounts.length === 0 && <p className="px-6">Loading accounts...</p>}
                              {accounts.length > 0 && accounts.map((acc, index) => {
                                    const isSelected = values.selectedAccounts.some(a => a.address === acc.address);
                                    
                                    return (
                                      <li
                                        key={index}
                                        onClick={() => {
                                          const selected = values.selectedAccounts;
                                          if (isSelected) {
                                            setFieldValue(
                                              "selectedAccounts",
                                              selected.filter((a: any) => a.address !== acc.address)
                                            );
                                          } else {
                                            setFieldValue(
                                              "selectedAccounts",
                                              [...selected, acc]
                                            );
                                          }
                                        }}
                                        className={`px-6 tracking-wide text-sm cursor-pointer ${isSelected ? 'bg-blue-500 text-white dark:bg-neutral-800 dark:text-neutral-500' : ''}`}
                                      >
                                        {acc.address}
                                      </li>
                                    );
                                  })}
                            </ul>

                            {values.selectedAccounts.length === 0 && <p className="px-6 dark:text-neutral-500">No account(s) selected</p>}
                            {values.selectedAccounts.length > 0 && (
                              <div>
                                <h3 className="px-6 font-bold">Selected Accounts:</h3>
                                <ul>
                                  {values.selectedAccounts.map((acc, index) => (
                                    <li key={index} className="px-6 tracking-wide text-sm">
                                      {((acc as any).address)}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                              <div className="mx-6 mt-8">
                                <button
                                  type="submit"
                                  className="w-full full-rounded border border-neutral-200 hover:border-neutral-500 bg-transparent dark:text-neutral-100 dark:border-neutral-500 hover:dark:border-neutral-400 font-bold"
                                >
                                  Import Account(s)
                                </button>
                            </div>
                            </>}
                            </div>
                          </div>

                          
                        </form>
                      )}
                    </Formik>}
                </div>
              ) : (
                <div className="mt-8 mb-36">
                  {_address ? (
                    <>
                      <ul className="space-y-2">
                        {_userAccounts.length && ( _userAccounts.map((account) => <Account key={account.address} account={account} />)
                        )}
                      </ul>
                    </>
                  ) : (
                    <p>Loading...</p>
                  )}
                </div>
              )}
              <div className="flex justify-center">
                {!promptAddAccount && (
                  <button
                    onClick={() => setPromptAddAccount(true)}
                    type="button"
                    className="max-w-sm full-rounded border border-neutral-200 hover:border-neutral-500 bg-transparent dark:text-neutral-100 dark:border-neutral-500 hover:dark:border-neutral-400 font-bold"
                  >
                    Import Account or Ledger Wallet
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </AnimatedDialog>
    </>
  );
};

export default UserAccount;

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
    config: config.stiff,
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
