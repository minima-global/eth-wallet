import { useContext } from "react";
import { appContext } from "../../AppContext";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";
import ConversionRateUSD from "../ConversionRateUSD";

const TokenList = () => {
  const { _currentNavigation } = useContext(appContext);
  const { _balance, _wrappedMinimaBalance } = useWalletContext();

  if (_currentNavigation !== "balance") {
    return null;
  }

  return (
    <div className="mx-4 md:mx-0">
      <h3 className="font-bold mb-2">Tokens</h3>

      <ul>
        <li className="grid grid-cols-[auto_1fr] bg-white items-center rounded-md bg-opacity-30 dark:bg-opacity-10 p-2 hover:bg-opacity-80 dark:hover:bg-opacity-30 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
            <g fill="none" fillRule="evenodd">
              <circle cx="16" cy="16" r="16" fill="#627EEA" />
              <g fill="#FFF" fillRule="nonzero">
                <path fillOpacity=".602" d="M16.498 4v8.87l7.497 3.35z" />
                <path d="M16.498 4L9 16.22l7.498-3.35z" />
                <path fillOpacity=".602" d="M16.498 21.968v6.027L24 17.616z" />
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
              <h3 className="font-bold">Ethereum</h3>
              <p className="font-mono text-sm">{_balance}</p>
            </div>
            <div>
              <ConversionRateUSD asset="ether" amount={_balance} />
            </div>
          </div>
        </li>
        <li className="grid grid-cols-[auto_1fr] bg-white items-center rounded-md dark:bg-opacity-10 bg-opacity-30 p-2 hover:bg-opacity-80 dark:hover:bg-opacity-30">
          <img
            alt="token-icon"
            src="./assets/token.svg"
            className="w-[36px] h-[36px] rounded-full"
          />

          <div className="flex justify-between ml-2">
            <div>
              <h3 className="font-bold">wMinima</h3>
              <p className="font-mono text-sm">
                {_wrappedMinimaBalance} 
              </p>
            </div>
            <div>
              <h3 className="font-mono">
                <ConversionRateUSD asset="minima" amount={_wrappedMinimaBalance} />
              </h3>
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default TokenList;
