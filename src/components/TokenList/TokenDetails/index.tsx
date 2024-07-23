import { useContext, useState } from "react";
import { appContext } from "../../../AppContext";
import { useSpring, animated, config } from "react-spring";
import { createPortal } from "react-dom";
import Dialog from "../../UI/Dialog";
import Cross from "../../UI/Cross";
import { formatUnits } from "ethers";
import { createAvatar } from "@dicebear/core";
import { rings } from "@dicebear/collection";
import { _defaults } from "../../../constants";
import { useWalletContext } from "../../../providers/WalletProvider/WalletProvider";
import Confirmation from "../../UI/Confirmation";

const TokenDetails = () => {
  const {
    _tokenDetails,
    _promptTokenDetails,
    promptTokenDetails,
    deleteAsset,
  } = useContext(appContext);

  const [_promptDeleteAsset, setPromptDeleteAsset] = useState(false);

  const { _network, _chainId } = useWalletContext();

  const springProps = useSpring({
    opacity: _promptTokenDetails ? 1 : 0,
    transform: _promptTokenDetails
      ? "translateY(0%) scale(1)"
      : "translateY(-50%) scale(0.8)",
    config: config.stiff,
  });

  if (!_promptTokenDetails) {
    return null;
  }

  const { name: tokenName, balance, decimals, address } = _tokenDetails;

  const handleDeleteAsset = () => {

    deleteAsset(address, _chainId);
    setPromptDeleteAsset(false);
    promptTokenDetails();

  }

  return (
    <>
      <Confirmation isOpen={_promptDeleteAsset}>
        <div className="shadow-lg dark:shadow-none bg-white text-black rounded-lg p-4 max-w-max mx-auto">
          <div className="px-4 flex items-center justify-between">
            <h3 className="font-bold">Delete Asset</h3>
            <Cross dismiss={() => setPromptDeleteAsset(false)} />            
          </div>
          <div className="px-4 my-3">
            <p>Do you want to stop tracking <span className="font-bold">{tokenName}</span>?</p>
            <div className="grid">              
                <div className="flex justify-end min-h-[100px] items-end">
                <button onClick={handleDeleteAsset} type="button" className="bg-black tracking-wide text-white w-full font-bold">
                  Stop tracking
                </button>
              </div>
            </div>
          </div>
        </div>
      </Confirmation>

      {_promptTokenDetails &&
        createPortal(
          <Dialog extraClass="z-[25]" dismiss={promptTokenDetails}>
            <div className="h-full grid items-center">
              <animated.div style={springProps}>
                <div className="bg-white shadow-lg  shadow-slate-300  dark:shadow-none dark:bg-black w-[calc(100%_-_16px)] md:w-full p-4 px-0 rounded mx-auto">
                  <div className="px-4 flex items-center justify-between">                    
                      {/* <button 
                        onClick={() => deleteAsset(address, _chainId)} 
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Delete
                      </button> */}
                    <h6 className="font-bold">Token Details</h6>
                    <Cross dismiss={promptTokenDetails} />
                  </div>
                  <div className="break-all">
                    <div className="flex flex-col items-center justify-center">
                      {_defaults["wMinima"][_network].toUpperCase() === address.toUpperCase() ? (
                        <img
                          alt="token-icon"
                          src="./assets/wtoken.svg"
                          className="w-[48px] h-[48px] rounded-full"
                        />
                      ) : _defaults["Tether"][_network].toUpperCase() === address.toUpperCase() ? (
                        <img
                          alt="token-icon"
                          src="./assets/tether.svg"
                          className="w-[48px] h-[48px] rounded-full"
                        />
                      ) : (
                        <Bear extraClass="w-[48px]" input={address} />
                      )}

                      <h6 className="font-bold text-xl my-4 mb-2">
                        {tokenName}
                      </h6>
                      <p className="font-mono dark:text-teal-300">
                        {/* Hack for getting custom USDT wrong decimals on Sepolia.. */}
                        {formatUnits(
                          balance,
                          address ===
                            "0xb3BEe194535aBF4E8e2C0f0eE54a3eF3b176703C"
                            ? 18
                            : decimals
                        ).toString()}
                      </p>
                    </div>
                    <div className="px-4 my-8">
                      <div>
                        <h6 className="font-bold text-sm">
                          Τoken contract address
                        </h6>
                        <p className="font-mono">{address}</p>
                      </div>
                      <div className="my-4">
                        <h6 className="font-bold text-sm">Decimals</h6>
                        <p className="font-mono">{decimals}</p>
                      </div>
                      <div>
                        <button
                          onClick={() => setPromptDeleteAsset(true)}
                          type="button"
                          className="bg-neutral-100 text-neutral-600 hover:bg-opacity-80 dark:hover:bg-opacity-30 dark:bg-[#1B1B1B] dark:text-[#FEFEFF] w-full tracking-wider"
                        >
                          Delete Asset
                        </button>
                      </div>
                    </div>
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

export default TokenDetails;

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
