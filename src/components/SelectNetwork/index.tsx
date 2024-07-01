import { useContext, useState } from "react";
import { useSpring, animated, config } from "react-spring";
import { createPortal } from "react-dom";
import { appContext } from "../../AppContext";

import styles from "./Styles.module.css";
import { Formik } from "formik";
import * as yup from "yup";

import Dialog from "../UI/Dialog";
import EthereumNetwork from "../UI/EthereumNetwork";
import SepoliaNetwork from "../UI/SepoliaNetwork";
import CustomNetwork from "../UI/CustomNetwork";
import BackButton from "../UI/BackButton";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";

const SelectNetwork = () => {
  const {
    addCustomNetwork,
    _currentNetwork,
    _defaultNetworks,
    _promptSelectNetwork,
    promptSelectNetwork,
    verifyRPCNetwork,
    updatePreferredNetwork,
  } = useContext(appContext);
  const { _network } = useWalletContext();

  const [step, setStep] = useState(1);

  const springProps = useSpring({
    opacity: _promptSelectNetwork ? 1 : 0,
    transform: _promptSelectNetwork
      ? "translateY(0%) scale(1)"
      : "translateY(-50%) scale(0.8)",
    config: config.stiff,
  });

  const addCustomNetworkSpringProps = useSpring({
    opacity: step === 2 ? 1 : 0,
    config: config.gentle,
  });

  const handleNetworkChange = (networkName: string) => {
    updatePreferredNetwork(networkName);
  };

  return (
    <>
      <div
        className="my-4 p-2 px-3 hover:cursor-pointer bg-gray-50 bg-opacity-80 dark:bg-[#1B1B1B] hover:bg-opacity-30 dark:bg-opacity-50 grid grid-cols-[1fr_auto]"
        onClick={promptSelectNetwork}
      >
        {_network === "mainnet" && <EthereumNetwork />}
        {_network === "unknown" && <CustomNetwork />}
        {_network === "sepolia" && <SepoliaNetwork />}
        {_network.length === 0 && <p className="font-bold">Select Network</p>}
      </div>

      {_promptSelectNetwork &&
        createPortal(
          <Dialog extraClass="z-[22]" dismiss={promptSelectNetwork}>
            <div className="h-full grid items-center">
              <animated.div style={springProps}>
                <div className="bg-white shadow-lg  shadow-slate-300  dark:shadow-none dark:bg-black w-[calc(100%_-_16px)] md:w-full p-4 px-0 rounded mx-auto">
                  {step === 1 && (
                    <div>
                      <div className="flex justify-between pr-4">
                        <h1 className="text-lg md:text-xl px-4 mb-4">
                          Select a network
                        </h1>
                        <svg
                          onClick={promptSelectNetwork}
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          strokeWidth="2.5"
                          stroke="currentColor"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                          <path d="M18 6l-12 12" />
                          <path d="M6 6l12 12" />
                        </svg>
                      </div>
                      <div className="grid grid-cols-1">
                        <ul>
                          <li
                            key="1"
                            onClick={() => handleNetworkChange("mainnet")}
                            className={`flex items-center gap-2 p-4 ${
                              _network === "mainnet"
                                ? " bg-indigo-400 text-white font-bold dark:bg-indigo-600 "
                                : " hover:bg-violet-100 hover:text-black"
                            }`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="32"
                              height="33"
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
                            key="11155111"
                            onClick={() => handleNetworkChange("sepolia")}
                            className={`flex items-center gap-2  p-4 ${
                              _network === "sepolia"
                                ? "bg-indigo-400 text-white font-bold dark:bg-indigo-600"
                                : " hover:bg-violet-100 hover:text-black"
                            }`}
                          >
                            <div className="rounded-full w-8 h-8 bg-violet-300 flex justify-center items-center">
                              <span className="text-gray-600 font-bold text-xl">
                                S
                              </span>
                            </div>
                            Sepolia
                          </li>
                        </ul>

                        {_defaultNetworks && (
                          <>
                            <div className="grid grid-cols-[1fr_auto] items-center">
                              <h6 className="px-4 text-sm py-2">
                                Custom networks
                              </h6>
                              <a
                                className="mx-4 px-2 hover:bg-indigo-500 hover:text-indigo-200 hover:font-bold cursor-pointer text-sm rounded bg-none text-indigo-500 border border-indigo-500"
                                onClick={() => setStep(2)}
                              >
                                Add Network
                              </a>
                            </div>
                            {Object.keys(_defaultNetworks).filter(
                              (k) => k !== "mainnet" && k !== "sepolia"
                            ).length === 0 && (
                              <p className="text-sm px-4 text-gray-400">
                                No custom networks added yet
                              </p>
                            )}
                            <ul className="mb-4 max-h-32 overflow-y-auto">
                              {Object.keys(_defaultNetworks)
                                .filter(
                                  (k) => k !== "mainnet" && k !== "sepolia"
                                )
                                .map((k) => (
                                  <li
                                    key={_defaultNetworks[k].chainId}
                                    onClick={() =>
                                      handleNetworkChange(
                                        _defaultNetworks[k].name
                                      )
                                    }
                                    className={`flex items-center gap-2 p-4 ${
                                      _network === "unknown" &&
                                      _currentNetwork ===
                                        _defaultNetworks[k].name
                                        ? "bg-indigo-400 text-white font-bold dark:bg-indigo-600"
                                        : " hover:bg-violet-100 hover:text-black"
                                    }`}
                                  >
                                    <div className="rounded-full w-8 h-8 bg-violet-300 flex justify-center items-center">
                                      <span className="text-gray-600 font-bold text-xl">
                                        {_defaultNetworks[k].name
                                          .charAt(0)
                                          .toUpperCase()}
                                      </span>
                                    </div>
                                    {_defaultNetworks[k].name}
                                  </li>
                                ))}
                            </ul>
                          </>
                        )}
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
                          validationSchema={yup.object().shape({
                            rpc: yup
                              .string()
                              .test(
                                "unique-rpc",
                                "This RPC already exists on the network",
                                function (value) {
                                  const { path, createError } = this;
                                  const networkWithRPC: any = Object.values(
                                    _defaultNetworks
                                  ).find((network: any) => network.rpc === value);

                                  if (networkWithRPC) {
                                    const networkName = networkWithRPC.name;
                                    return createError({
                                      path,
                                      message: `This RPC already exists on the network ${networkName}`,
                                    });
                                  }

                                  return true;
                                }
                              ),
                          })}
                          initialValues={{
                            rpc: "",
                            name: "",
                            chainId: "",
                            symbol: "",
                          }}
                          onSubmit={async (
                            { rpc, name, chainId, symbol },
                            { setErrors }
                          ) => {
                            try {
                              // First we verify if node is online...
                              await verifyRPCNetwork(rpc);

                              // add new
                              await addCustomNetwork({
                                rpc,
                                name,
                                chainId,
                                symbol,
                              });
                              // Toast message that we added a new network would be nice...
                              setStep(1);
                            } catch (error) {
                              setErrors({
                                rpc: "Invalid JSON-RPC URL.  Could not establish connection.",
                              });
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
                                {...getFieldProps("rpc")}
                                type="text"
                                placeholder="Custom JSON-RPC"
                                className={`mb-2 ${
                                  touched.rpc && errors.rpc
                                    ? "outline !outline-red-500"
                                    : ""
                                }`}
                              />
                              {errors.rpc && (
                                <span className="text-white bg-red-500 rounded px-4 py-1">
                                  {errors.rpc}
                                </span>
                              )}
                              <input
                                disabled={isSubmitting}
                                required
                                {...getFieldProps("name")}
                                type="text"
                                placeholder="Network name"
                                className={`mb-2 ${
                                  touched.name && errors.name
                                    ? "outline !outline-red-500"
                                    : ""
                                }`}
                              />
                              {touched.name && errors.name && (
                                <span className="my-2 bg-red-500 rounded px-4 py-1">
                                  {errors.name}
                                </span>
                              )}
                              <input
                                disabled={isSubmitting}
                                required
                                {...getFieldProps("chainId")}
                                type="text"
                                placeholder="Chain Id"
                                className={`mb-2 ${
                                  touched.chainId && errors.chainId
                                    ? "outline !outline-red-500"
                                    : ""
                                }`}
                              />
                              {touched.chainId && errors.chainId && (
                                <span className="my-2 bg-red-500 rounded px-4 py-1">
                                  {errors.chainId}
                                </span>
                              )}
                              <input
                                disabled={isSubmitting}
                                required
                                {...getFieldProps("symbol")}
                                type="text"
                                placeholder="Asset Symbol"
                                className={`mb-2 ${
                                  touched.symbol && errors.symbol
                                    ? "outline !outline-red-500"
                                    : ""
                                }`}
                              />
                              {touched.symbol && errors.symbol && (
                                <span className="my-2 bg-red-500 rounded px-4 py-1">
                                  {errors.symbol}
                                </span>
                              )}
                              <button
                                type="submit"
                                disabled={!isValid}
                                className="bg-black text-white dark:bg-white dark:text-black p-4 font-bold disabled:bg-slate-300 dark:disabled:bg-opacity-10 dark:disabled:text-gray-600"
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
