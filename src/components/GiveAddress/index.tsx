import { createPortal } from "react-dom";
import { useSpring, animated, config } from "react-spring";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";
import Dialog from "../UI/Dialog";
import styles from "./GiveAddress.module.css";
import { useContext } from "react";
import { appContext } from "../../AppContext";
const GiveAddress = () => {
  const { _wallet } = useWalletContext();
  const {_generatedKey, createKey} = useContext(appContext);

  const springProps = useSpring({
    opacity: !_wallet ? 1 : 0,
    transform: !_wallet
      ? "translateY(0%) scale(1)"
      : "translateY(-50%) scale(0.8)",
    config: config.wobbly,
  });



  if (_wallet) {
    return null;
  }

  return createPortal(
    <Dialog>
      <div className="h-[100vh_-_64px] grid items-center mt-[80px]">
        <animated.div className={styles['tokens']} style={springProps}>
          <div className=" bg-white shadow-lg shadow-slate-300 dark:shadow-sm dark:bg-black w-[calc(100%_-_16px)] md:w-full p-4 px-0 rounded mx-auto">

            <div className="px-4 flex flex-col gap-4">
            <h3 className="mx-4 font-bold">Enter a valid private key</h3>
            <input placeholder="Enter a valid private key" value={_generatedKey} onChange={(evt) => {
                const _k = evt.target.value;
                createKey(_k);
                (window as any).MDS.keypair.set("_k", _k, function(val) {

                });
            }} />

            </div>
          </div>
        </animated.div>
      </div>
    </Dialog>,
    document.body
  );
};


export default GiveAddress;