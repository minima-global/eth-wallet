import { useContext, useState } from "react";
import { createPortal } from "react-dom";
import { useSpring, animated, config } from "react-spring";
import { appContext } from "../../AppContext";
import Dialog from "../UI/Dialog";
import { Formik } from "formik";

import styles from "./Balance.module.css";
import GasEstimation from "../GasFeeEstimate";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";
import AddressBook from "../AddressBook";
import ConversionRateUSD from "../ConversionRateUSD";
import AddressBookContact from "../AddressBookContact";

import {
  getAddress,
} from "ethers";

import * as yup from "yup";
import SelectAsset from "../SelectAsset";
import Decimal from "decimal.js";
import { useGasContext } from "../../providers/GasProvider";
import { useActivityHandlerContext } from "../../providers/ActivityHandlerProvider";

const Send = () => {
  const {  gas} = useGasContext();
  const {transactionStatusHandler} = useActivityHandlerContext();
  const { _currentNavigation, handleNavigation, updateActivities, _provider } =
    useContext(appContext);
  const { _balance, _wrappedMinimaBalance } = useWalletContext();
  const { _wallet, transfer, transferToken } = useWalletContext();
  const [step, setStep] = useState(1);

  const springProps = useSpring({
    opacity: _currentNavigation === "send" ? 1 : 0,
    transform:
      _currentNavigation === "send"
        ? "translateY(0%) scale(1)"
        : "translateY(-50%) scale(0.8)",
    config: config.wobbly,
  });

  const handleClearButton = (setFieldValueRef: any) => {
    setFieldValueRef("address", "");
    setStep(1);
  };

  if (_currentNavigation !== "send") {
    return null; 
  }

  return (
    _currentNavigation === "send" &&
    createPortal(
      <Dialog>
        <div className="h-[100vh_-_64px] grid items-start mt-[80px]">
          <animated.div className={styles["tokens"]} style={springProps}>
            <div className=" bg-white shadow-lg  shadow-slate-300 dark:shadow-sm dark:bg-black w-[calc(100%_-_16px)] md:w-full p-4 px-0 rounded mx-auto">
              <h3 className="px-4 text-lg font-bold text-center">
                {step === 1 && "Send to"}
                {step === 2 && "Enter amount"}
                {step === 3 && "Transaction details"}
              </h3>
              <Formik
                validationSchema={yup.object().shape({
                  address: yup
                    .string()
                    .required("Address is required")
                    .test("testing address checksum", function (val) {
                      const { path, createError } = this;

                      try {
                        getAddress(val);
                        return true;
                      } catch (error) {
                        return createError({
                          path,
                          message: "Invalid Ethereum address",
                        });
                      }
                    }),
                  amount: yup
                    .string()
                    .required("Amount is required")
                    .test("has funds", function (val) {
                      const { path, createError, parent } = this;

                      try {
                        if (
                          parent.asset === "ether" &&
                          new Decimal(val).gt(_balance)
                          // || transactionTotal && new Decimal(transactionTotal!).gt(_wrappedMinimaBalance)
                        ) {
                          throw new Error();
                        }

                        if (
                          parent.asset === "minima" &&
                          new Decimal(val).gt(_wrappedMinimaBalance)
                          // || transactionTotal && new Decimal(transactionTotal!).gt(_wrappedMinimaBalance)
                        ) {
                          throw new Error();
                        }

                        return true;
                      } catch (error) {
                        return createError({
                          path,
                          message: "Insufficient funds",
                        });
                      }
                    }),
                })}
                initialValues={{
                  amount: "",
                  asset: "ether",
                  address: "",
                }}
                onSubmit={async ({ amount, address, asset}, {resetForm}) => {
                  try {
                    if (asset === "ether") {
                      const resp = await transfer(address, amount, gas!);
                      // Update activities
                      updateActivities(resp!);
                      
                      // activityHandler will take care of this now..
                      resetForm();
                      handleNavigation("activity");
                    }

                    if (asset === "minima") {
                      const resp = await transferToken(address, amount, gas!);
                      
                      updateActivities(resp!);

                      // activityHandler will take care of this now..
                      resetForm();
                      handleNavigation("activity");
                    }
                  } catch (error) {
                    console.error(error);
                    // display error message
                  }
                }}
              >
                {({
                  handleSubmit,
                  setFieldValue,
                  isSubmitting,
                  getFieldProps,
                  handleChange,
                  handleBlur,
                  touched,
                  errors,
                  values,
                  isValid,
                  dirty,
                }) => (
                  <form onSubmit={handleSubmit}>
                    {step === 1 && (
                      <div className="mb-4">
                        <div className="px-4 py-4">
                          <div className="mb-2">
                            <input
                              disabled={isSubmitting}
                              required
                              id="address"
                              name="address"
                              type="text"
                              onBlur={handleBlur}
                              placeholder="Recipient public (0x) Address or ENS name"
                              className={`mb-2 ${
                                dirty && errors.address
                                  ? "!border-4 !border-red-500"
                                  : ""
                              }`}
                              onChange={(e) => {
                                handleChange(e);
                                try {
                                  getAddress(e.target.value);
                                  setStep(2);
                                } catch (error) {
                                  // BAD
                                }
                              }}
                            />
                          </div>

                          {dirty && errors.address && (
                            <div className="my-2 bg-red-500 text-white rounded px-4 py-1">
                              {errors.address}
                            </div>
                          )}
                        </div>
                        <AddressBook setStep={setStep} />
                      </div>
                    )}
                    {step === 2 && (
                      <div className="mt-4">
                        <div className={styles["input_button_wrapper"]}>
                          <input
                            disabled={isSubmitting}
                            required
                            {...getFieldProps("address")}
                            type="text"
                            readOnly
                            placeholder="Recipient public (0x) Address or ENS name"
                          />
                          <button
                            onClick={() => handleClearButton(setFieldValue)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="32"
                              height="32"
                              viewBox="0 0 22 22"
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
                              <path d="M18 6l-12 12" />
                              <path d="M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="mt-2 mx-4">
                          <SelectAsset />

                          {touched.asset && errors.asset && (
                            <div className="mx-4 my-2 bg-red-500 text-white rounded px-4 py-1">
                              {errors.asset}
                            </div>
                          )}
                        </div>
                        <div className="mt-2 mx-4">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              className="p-0 mr-4 text-teal-500 focus:border-none focus:outline-none text-sm font-bold"
                            >
                              Max
                            </button>
                          </div>
                          <label className="relative">
                            <input
                              disabled={isSubmitting}
                              required
                              {...getFieldProps("amount")}
                              type="text"
                              autoFocus
                              placeholder="Amount"
                              className={`font-mono mb-2 !pr-16 ${
                                touched.amount && errors.amount
                                  ? "!border-4 !border-red-500"
                                  : ""
                              }`}
                            />
                            <span className="absolute right-4 top-0 font-bold">
                              {values.asset === "ether" && "ETH"}
                              {values.asset === "minima" && "WMINIMA"}
                            </span>
                          </label>
                          <div className="mx-4 text-purple-500 flex items-center justify-end">
                            <ConversionRateUSD
                              amount={values.amount}
                              asset={values.asset}
                            />
                          </div>

                          {touched.amount && errors.amount && (
                            <div className="mb-2 bg-red-500 text-white rounded px-4 py-1">
                              {errors.amount}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {step === 3 && (
                      <div className="pb-4">
                        <div className="mt-4 mb-4 bg-teal-500 px-4 flex items-center justify-between">
                          <AddressBookContact address={_wallet!.address} />
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="34"
                            height="34"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="#7f5345"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path
                              d="M12.089 3.634a2 2 0 0 0 -1.089 1.78l-.001 2.585l-1.999 .001a1 1 0 0 0 -1 1v6l.007 .117a1 1 0 0 0 .993 .883l1.999 -.001l.001 2.587a2 2 0 0 0 3.414 1.414l6.586 -6.586a2 2 0 0 0 0 -2.828l-6.586 -6.586a2 2 0 0 0 -2.18 -.434l-.145 .068z"
                              strokeWidth="0"
                              fill="currentColor"
                            />
                            <path
                              d="M3 8a1 1 0 0 1 .993 .883l.007 .117v6a1 1 0 0 1 -1.993 .117l-.007 -.117v-6a1 1 0 0 1 1 -1z"
                              strokeWidth="0"
                              fill="currentColor"
                            />
                            <path
                              d="M6 8a1 1 0 0 1 .993 .883l.007 .117v6a1 1 0 0 1 -1.993 .117l-.007 -.117v-6a1 1 0 0 1 1 -1z"
                              strokeWidth="0"
                              fill="currentColor"
                            />
                          </svg>
                          <AddressBookContact
                            contact
                            address={values.address}
                          />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mx-4">
                            <h3 className="font-bold">Asset</h3>
                            <p className="font-mono">
                              {values.asset === "ether" && "Ethereum"}
                              {values.asset === "minima" && "wMinima"}
                            </p>
                          </div>
                          <div className="flex justify-between items-center mx-4">
                            <h3 className="font-bold">Amount</h3>
                            <div className="text-right">
                              <p className="font-mono font-bold">
                                {values.amount}
                              </p>
                              <ConversionRateUSD
                                asset={values.asset}
                                amount={values.amount}
                              />
                            </div>
                          </div>

                          <GasEstimation />
                        </div>
                      </div>
                    )}                    
                    <div
                      className={`${styles["button__navigation"]} ${
                        step === 1 || step === 4
                          ? styles.button__navigation_one
                          : ""
                      }`}
                    >
                      <nav>
                        {step === 1 && (
                          <>
                            <button
                              onClick={() => handleNavigation("balance")}
                              className="dark:bg-white bg-black text-white bg-opacity-90 dark:text-black disabled:bg-opacity-10 disabled:text-slate-500 font-bold"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {step === 2 && (
                          <>
                            <button
                              type="button"
                              onClick={() => setStep(1)}
                              className="dark:bg-white bg-black text-white bg-opacity-90 dark:text-black disabled:bg-opacity-10 disabled:text-slate-500 font-bold"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => setStep(3)}
                              disabled={!isValid}
                              className="bg-teal-300 bg-opacity-90 text-black disabled:bg-opacity-10 disabled:text-slate-500 font-bold"
                            >
                              Next
                            </button>
                          </>
                        )}
                        {step === 3 && (
                          <>
                            <button
                              type="button"
                              onClick={() => setStep(1)}
                              className="dark:bg-white bg-black text-white bg-opacity-90 dark:text-black disabled:bg-opacity-10 disabled:text-slate-500 font-bold"
                            >
                              Reject
                            </button>
                            <button
                              type="submit"
                              disabled={!isValid}
                              className="bg-teal-500 bg-opacity-90 text-black disabled:bg-opacity-10 disabled:text-slate-500 font-bold"
                            >
                              Send
                            </button>
                          </>
                        )}                        
                      </nav>
                    </div>
                  </form>
                )}
              </Formik>
            </div>
          </animated.div>
        </div>
      </Dialog>,
      document.body
    )
  );
};

export default Send;

// normal transfer json receipt
/**
 * {
    "_type": "TransactionReceipt",
    "accessList": [],
    "blockNumber": null,
    "blockHash": null,
    "chainId": "31337",
    "data": "0x",
    "from": "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E",
    "gasLimit": "21001",
    "gasPrice": null,
    "hash": "0x194ecbb10687e63b70eb105ba6f9cc09a23773d4c150ea7ea4e9d9dc1647da20",
    "maxFeePerGas": "2750000000",
    "maxPriorityFeePerGas": "1000000000",
    "nonce": 1,
    "signature": {
        "_type": "signature",
        "networkV": null,
        "r": "0x42919c2e0360cda36f948ad2bd01f04ae07cd766ccd171e0afae2c852d322c86",
        "s": "0x4ae5bfe941f9c4a9a75dee1c1ba87ab6f8ae1d905abe1afe617f01ae565cdedf",
        "v": 28
    },
    "to": "0x95Eea59d1130f0A71afDE7a33d1fe4aFC3b63d9A",
    "type": 2,
    "value": "55000000000000000000"
}
 */
