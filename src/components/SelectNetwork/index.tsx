import { useContext, useEffect, useState } from "react";
import { useSpring, animated, config } from "react-spring";
import { createPortal } from "react-dom";
import { appContext } from "../../AppContext";

import styles from "./Styles.module.css";
import { Formik } from "formik";

import Dialog from "../UI/Dialog";
import EthereumNetwork from "../UI/EthereumNetwork";
import SepoliaNetwork from "../UI/SepoliaNetwork";
import CustomNetwork from "../UI/CustomNetwork";
import BackButton from "../UI/BackButton";

const SelectNetwork = () => {
  const {
    _promptSelectNetwork,
    promptSelectNetwork,
    _provider,
    setRPCNetwork,
    verifyRPCNetwork
  } = useContext(appContext);

  const [network, setNetwork] = useState("unknown");
  const [step, setStep] = useState(1);


  const springProps = useSpring({
    opacity: _promptSelectNetwork ? 1 : 0,
    transform: _promptSelectNetwork
      ? "translateY(0%) scale(1)"
      : "translateY(-50%) scale(0.8)",
    config: config.wobbly,
  });

  const addCustomNetworkSpringProps = useSpring({
    opacity: step === 2 ? 1 : 0,
    config: config.gentle,
  });

  const handleNetworkChange = (network: string) => {
    setRPCNetwork(network);
    promptSelectNetwork();
  };

  useEffect(() => {
    (async () => {
      const p = await _provider.getNetwork();

      setNetwork(p.name);
    })();
  }, [_provider]);

  return (
    <>
      <div
        className="mx-auto bg-gray-300 dark:bg-black text-black dark:text-white dark:text-opacity-90 p-2 px-3 rounded-full hover:bg-opacity-70 hover:cursor-pointer"
        onClick={promptSelectNetwork}
      >
        {network === "mainnet" && <EthereumNetwork />}
        {network === "unknown" && <CustomNetwork />}
        {network === "sepolia" && <SepoliaNetwork />}
      </div>

      {_promptSelectNetwork &&
        createPortal(
          <Dialog dismiss={promptSelectNetwork}>
            <div className="h-full grid items-center">
              <animated.div style={springProps}>
                <div className="bg-white shadow-lg  shadow-slate-300  dark:shadow-none dark:bg-black w-[calc(100%_-_16px)] md:w-full p-4 px-0 rounded mx-auto">
                  {step === 1 && (
                    <div>
                      <h1 className="text-lg md:text-xl px-4 mb-4">
                        Select a network
                      </h1>

                      <div className="grid grid-cols-1">
                        <ul>
                          <li
                            onClick={() => handleNetworkChange("mainnet")}
                            className={`flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-white dark:hover:text-black p-4 ${network === 'mainnet' ? "bg-slate-300 dark:bg-slate-600 ":""}`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="32"
                              height="32"
                            >
                              <g fill="none" fillRule="evenodd">
                                <circle cx="16" cy="16" r="16" fill="#627EEA" />
                                <g fill="#FFF" fillRule="nonzero">
                                  <path
                                    fillOpacity=".602"
                                    d="M16.498 4v8.87l7.497 3.35z"
                                  />
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
                                  <path
                                    fillOpacity=".602"
                                    d="M9 16.22l7.498 4.353v-7.701z"
                                  />
                                </g>
                              </g>
                            </svg>
                            Ethereum Mainnet
                          </li>
                        </ul>
                        <h6 className="px-4 text-sm py-2">Test networks</h6>
                        <ul className="mb-4">
                          <li
                            onClick={() => handleNetworkChange("sepolia")}
                            className={`flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-white dark:hover:text-black p-4 ${network === 'sepolia' ? "bg-slate-300 dark:bg-slate-600":""}`}
                          >
                            <svg
                              className="dark:fill-white dark:bg-opacity-80"
                              xmlns="http://www.w3.org/2000/svg"
                              width="32"
                              height="32"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="#2c3e50"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path
                                stroke="none"
                                d="M0 0h24v24H0z"
                                fill="none"
                              />
                              <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                              <path d="M10 15a1 1 0 0 0 1 1h2a1 1 0 0 0 1 -1v-2a1 1 0 0 0 -1 -1h-2a1 1 0 0 1 -1 -1v-2a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1" />
                            </svg>
                            Sepolia
                          </li>
                        </ul>

                        <button
                          onClick={() => setStep(2)}
                          className="bg-black mx-4 text-white p-4 font-bold dark:bg-white dark:text-black"
                        >
                          Add Custom
                        </button>
                      </div>
                    </div>
                  )}
                  {step === 2 && (
                    <animated.div style={addCustomNetworkSpringProps}>
                      <div className="flex items-center mb-4">
                        <BackButton handleBack={() => setStep(1)} />
                        <h1 className="text-lg md:text-xl px-4">
                          Add a custom network
                        </h1>
                      </div>

                      <div className="grid grid-cols-1">
                        <Formik                          
                          initialValues={{ network: "" }}
                          onSubmit={async ({network}, {setErrors}) => {
                            try {                              
                              await verifyRPCNetwork(network);
                              
                              // is valid/can connect, add
                              setRPCNetwork(network);
                              setStep(1);
                              promptSelectNetwork();
                            } catch (error) {
                              console.log('no.')
                              setErrors({network: "Invalid JSON-RPC URL.  Could not establish connection."});
                              console.error(error);
                            }

                          }}
                        >
                          {({
                            getFieldProps,
                            errors,
                            touched,
                            isValid,
                            handleSubmit,
                            isSubmitting,
                          }) => (
                            <form
                              onSubmit={handleSubmit}
                              className={styles["tokens"]}
                            >
                              <input
                                disabled={isSubmitting}
                                required
                                {...getFieldProps("network")}
                                type="text"
                                placeholder="Custom JSON-RPC"
                                className={`mb-2 ${
                                  touched.network && errors.network
                                    ? "outline !outline-red-500"
                                    : ""
                                }`}
                              />
                              {touched.network && errors.network && (
                                <span className="my-2 bg-red-500 rounded px-4 py-1">
                                  {errors.network}
                                </span>
                              )}
                            <button
                              type="submit"
                              disabled={!isValid}                              
                              className="bg-black text-white dark:bg-white dark:text-black p-4 font-bold disabled:bg-slate-300"
                            >
                              Add
                            </button>
                            </form>
                          )}
                        </Formik>                        

                      </div>
                    </animated.div>
                  )}
                </div>
              </animated.div>
            </div>
          </Dialog>,
          document.body
        )}
    </>
  );
};

export default SelectNetwork;
