import { useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { appContext } from "../../AppContext";
import { useSpring, animated, config } from "react-spring";
import Dialog from "../UI/Dialog";

import * as utils from "../../utils";
import styles from "./AddressBookAdd.module.css";

const AddressBookAdd = ({ address }) => {
  const {
    _promptAddressBookAdd,
    promptAddressBookAdd,
    _addressBook,
    updateAddressBook,
  } = useContext(appContext);
  const [nickname, setNickname] = useState("");

  const handleChange = (e) => {
    setNickname(e.target.value);
  };

  useEffect(() => {
    if (_addressBook && _addressBook[address]) {
      setNickname(_addressBook[address]);
    }
  }, []);

  const springProps = useSpring({
    opacity: _promptAddressBookAdd ? 1 : 0,
    transform: _promptAddressBookAdd
      ? "translateY(0%) scale(1)"
      : "translateY(-50%) scale(0.8)",
    config: config.wobbly,
  });

  if (!_promptAddressBookAdd) {
    return null;
  }

  return createPortal(
    <Dialog extraClass="z-[26]" dismiss={promptAddressBookAdd}>
      <div className="h-full grid items-start">
        <animated.div style={springProps}>
          <div className="bg-white shadow-lg mt-[80px] shadow-slate-300  dark:shadow-none dark:bg-black w-[calc(100%_-_16px)] md:w-full p-4 px-0 rounded mx-auto">
            <div className="flex items-center justify-center">
              <h3 className="px-4 text-lg font-bold text-center">
                Enter a nickname to save in address book
              </h3>
            </div>
            <div
              className={`${styles["tokens"]} flex justify-center items-center mt-4`}
            >
              <input
                value={nickname}
                onChange={handleChange}
                placeholder="Enter nickname"
              />
              <svg
                onClick={() =>
                  updateAddressBook(address, utils.sanitizeSQLInput(nickname))
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
            <div className="flex items-center justify-center mt-8">
                
            <button className="dark:bg-white w-[calc(100%_-_32px)] bg-black text-white bg-opacity-90 dark:text-black disabled:bg-opacity-10 disabled:text-slate-500 font-bold" onClick={promptAddressBookAdd}>Dismiss</button>
            </div>
          </div>
        </animated.div>
      </div>
    </Dialog>,
    document.body
  );
};

export default AddressBookAdd;
