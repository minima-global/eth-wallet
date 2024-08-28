import { useContext, useEffect } from "react";
import { appContext } from "../../AppContext";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";
import { useTokenStoreContext } from "../../providers/TokenStoreProvider";
import { formatUnits } from "ethers";
import ImportToken from "../ImportToken";
import { _defaults } from "../../constants";
import RefreshIcon from "../UI/Icons/RefreshIcon";

import { differenceInSeconds } from "date-fns";
import { rings } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";

const TokenList = () => {
  const {
    loaded,
    _currentNavigation,
    promptTokenDetails,
    _triggerBalanceUpdate
  } = useContext(appContext);
  const { _balance, _network, callBalanceForApp } = useWalletContext();
  const { tokens } = useTokenStoreContext();

  const handlePullBalance = () => {
    (window as any).MDS.keypair.get("_lastethbalancecheck", (resp) => {
      if (resp.status) {
        const dt = JSON.parse(resp.value);
        const now = new Date().getTime();

        // Convert dt.timestamp and now to Date objects
        const lastCheck = new Date(dt.timestamp);
        const currentTime = new Date(now);

        // Check if the difference is more than 60 seconds
        if (differenceInSeconds(currentTime, lastCheck) > 60) {
          (window as any).MDS.keypair.set(
            "_lastethbalancecheck",
            JSON.stringify({ timestamp: now }),
            () => {}
          );

          callBalanceForApp();
        }
      } else {
        callBalanceForApp();
        // Set first time..
        const now = new Date().getTime();
        (window as any).MDS.keypair.set(
          "_lastethbalancecheck",
          JSON.stringify({ timestamp: now }),
          () => {}
        );
      }
    });
  };

  useEffect(() => {
    if (_currentNavigation === "balance") {
      // Get Ethereum balance every 60s
      if (loaded && loaded.current) {
        handlePullBalance();
      }
    }
  }, [_currentNavigation, loaded]);

  if (_currentNavigation !== "balance") {
    return null;
  }
  return (
    <div className="mx-4 md:mx-0">
      <div className="grid grid-cols-[1fr_auto]">
        <h3 className="font-bold mb-2">Your Tokens</h3>
        <span onClick={callBalanceForApp} className={`dark:text-sky-500 ${_triggerBalanceUpdate && "!animate-spin !text-neutral-300"}`}>
          <RefreshIcon            
            fill="currentColor"
          />
        </span>
      </div>

      {_triggerBalanceUpdate && (
        <p className="text-center text-xs font-bold opacity-50 animate-pulse">
          Fetching balance...
        </p>
      )}
      {!_triggerBalanceUpdate && (
        <ul>
          {!!tokens.length && _network && tokens.map((token) => (
            <li
              onClick={() => promptTokenDetails(token)}
              key={token.address}
              className="shadow-sm dark:shadow-none grid grid-cols-[auto_1fr] bg-white items-center rounded-md bg-opacity-30 dark:bg-[#1B1B1B] p-2 hover:bg-opacity-80 dark:hover:bg-opacity-30 mb-2"
            >
              {_defaults["wMinima"][_network].toUpperCase() === token.address.toUpperCase() ? (
                <img
                  alt="token-icon"
                  src="./assets/wtoken.svg"
                  className="w-[36px] h-[36px] rounded-full"
                />
              ) : _defaults["Tether"][_network].toUpperCase() === token.address.toUpperCase() ? (
                <img
                  alt="token-icon"
                  src="./assets/tether.svg"
                  className="w-[36px] h-[36px] rounded-full"
                />
              ) : (
                <div className="my-auto w-[36px] h-[36px] bg-white rounded-full overflow-hidden flex justify-center items-center shadow-md text-black font-bold">
                  <Bear extraClass="w-[48px]" input={token.address} />
                </div>
              )}

              <div className="flex justify-between ml-2">
                <div>
                  <h3 className="font-bold">{token.name}</h3>
                  <p className="font-mono text-sm">
                    {token.address.toUpperCase() ===
                      "0xb3BEe194535aBF4E8e2C0f0eE54a3eF3b176703C".toUpperCase() &&
                      token.balance &&
                      formatUnits(token.balance, 18).toString()}
                    {token.address.toUpperCase() !==
                      "0xb3BEe194535aBF4E8e2C0f0eE54a3eF3b176703C".toUpperCase() &&
                      token.balance &&
                      formatUnits(token.balance, token.decimals).toString()}
                  </p>
                </div>
              </div>
            </li>
          ))}
          <li className="grid grid-cols-[auto_1fr] bg-white items-center rounded-md bg-opacity-30 dark:bg-[#1B1B1B] p-2 hover:bg-opacity-80 dark:hover:bg-opacity-30 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
              <g fill="none" fillRule="evenodd">
                <circle cx="16" cy="16" r="16" fill="#627EEA" />
                <g fill="#FFF" fillRule="nonzero">
                  <path fillOpacity=".602" d="M16.498 4v8.87l7.497 3.35z" />
                  <path d="M16.498 4L9 16.22l7.498-3.35z" />
                  <path
                    fillOpacity=".602"
                    d="M16.498 21.968v6.027L24 17.616z"
                  />
                  <path d="M16.498 27.995v-6.028L9 17.616z" />
                  <path
                    fillOpacity=".2"
                    d="M16.498 20.573l7.497-4.353-7.497-3.348z"
                  />
                  <path fillOpacity=".602" d="M9 16.22l7.498 4.353v-7.701z" />
                </g>
              </g>
            </svg>

            <div className="flex justify-between ml-2">
              <div>
                <h3 className="font-bold ">Ethereum</h3>
                <p className="font-mono text-sm">{_balance}</p>
              </div>
            </div>
          </li>
        </ul>
      )}

      {!_triggerBalanceUpdate && (
        <div>
          <ImportToken />
        </div>
      )}
    </div>
  );
};

export default TokenList;

interface BearProps {
  input: string;
  extraClass?: string;
}
const Bear = ({ input, extraClass }: BearProps) => {
  const avatar = createAvatar(rings, {
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
