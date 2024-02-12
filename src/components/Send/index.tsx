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

const Send = () => {
  const { _currentNavigation, handleNavigation } = useContext(appContext);
  const { _wallet } = useWalletContext();
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
      <Dialog dismiss={() => handleNavigation("balance")}>
        <div className="h-[100vh_-_64px] grid items-start mt-[80px]">
          <animated.div className={styles["tokens"]} style={springProps}>
            <div className=" bg-white shadow-lg  shadow-slate-300 dark:shadow-sm dark:bg-black w-[calc(100%_-_16px)] md:w-full p-4 px-0 rounded mx-auto">
              <h3 className="px-4 text-lg font-bold text-center">
                {step === 1 && "Sent to"}
                {step === 2 && "Enter amount"}
                {step === 3 && "Transaction details"}
              </h3>
              <Formik
                initialValues={{ amount: "", address: "" }}
                onSubmit={() => console.log("send")}
              >
                {({
                  handleSubmit,
                  setFieldValue,
                  isSubmitting,
                  getFieldProps,
                  touched,
                  errors,
                  values,
                  isValid,
                }) => (
                  <form onSubmit={handleSubmit}>
                    {step === 1 && (
                      <div className="mb-4">
                        <div className="px-4 py-4">
                          <input
                            disabled={isSubmitting}
                            required
                            {...getFieldProps("address")}
                            type="text"
                            placeholder="Recipient public (0x) Address or ENS name"
                            className={`mb-2 ${
                              touched.address && errors.address
                                ? "outline !outline-red-500"
                                : ""
                            }`}
                          />
                          {touched.address && errors.address && (
                            <span className="my-2 bg-red-500 rounded px-4 py-1">
                              {errors.address}
                            </span>
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
                            autoFocus={true}
                            placeholder="Recipient public (0x) Address or ENS name"
                            className={`${
                              touched.address && errors.address
                                ? "outline !outline-red-500"
                                : ""
                            }`}
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
                              placeholder="Amount"
                              className={`font-mono mb-2 !pr-16 ${
                                touched.amount && errors.amount
                                  ? "outline !outline-red-500"
                                  : ""
                              }`}
                            />
                            <span className="absolute right-4 top-0 font-bold">
                              ETH
                            </span>
                          </label>
                          <span>
                            <ConversionRateUSD
                              amount={values.amount}
                              asset="eth"
                            />
                          </span>

                          {touched.amount && errors.amount && (
                            <span className="my-2 bg-red-500 rounded px-4 py-1">
                              {errors.amount}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div className="pb-4">
                        <div className="mt-4 mb-4 bg-teal-500 px-4 flex items-center justify-between">
                          <h3 className="text-sm font-bold">
                            {_wallet!.address.substring(0, 7)}...
                            {_wallet!.address.substring(
                              _wallet!.address.length - 5,
                              _wallet!.address.length
                            )}
                          </h3>
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
                          <h3 className="text-sm font-bold">
                            {values.address.substring(0, 7)}...
                            {values.address.substring(
                              values.address.length - 5,
                              values.address.length
                            )}
                          </h3>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mx-4">
                            <h3 className="font-bold">Asset</h3>
                            <p className="font-mono">Ethereum</p>
                          </div>
                          <div className="flex justify-between items-center mx-4">
                            <h3 className="font-bold">Amount</h3>
                            <p className="font-mono">{values.amount}</p>
                          </div>

                          <GasEstimation
                            recipientAddress={values.address}
                            value={values.amount}
                          />
                        </div>
                      </div>
                    )}
                    <div
                      className={`${styles["button__navigation"]} ${
                        step === 1 ? styles.button__navigation_one : ""
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
                              onClick={() => setStep(1)}
                              className="dark:bg-white bg-black text-white bg-opacity-90 dark:text-black disabled:bg-opacity-10 disabled:text-slate-500 font-bold"
                            >
                              Cancel
                            </button>
                            <button
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
