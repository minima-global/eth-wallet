import { useContext, useState } from "react";
import { createPortal } from "react-dom";
import { useSpring, animated, config } from "react-spring";
import { appContext } from "../../AppContext";
import Dialog from "../UI/Dialog";
import { Formik } from "formik";

import GasEstimation from "../GasFeeEstimate";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";
import AddressBook from "../AddressBook";
import ConversionRateUSD from "../ConversionRateUSD";
import AddressBookContact from "../AddressBookContact";

import { formatUnits, getAddress, parseUnits } from "ethers";

import * as yup from "yup";
import SelectAsset from "../SelectAsset";
import Decimal from "decimal.js";
import { useTokenStoreContext } from "../../providers/TokenStoreProvider";
import { _defaults } from "../../constants";
import TransactionReceiptCard from "../TransactionReceipt";
import Cross from "../UI/Cross";
import InputWrapper from "../UI/FormComponents/InputWrapper";
import useGasInfo from "../../hooks/useGasInfo";
import { useGasContext } from "../../providers/GasProvider";

import * as utils from "../../utils";

const Send = () => {
  const {
    _currentNavigation,
    handleNavigation,
    _defaultNetworks,
    _currentNetwork,
    setTriggerBalanceUpdate
  } = useContext(appContext);
  const { tokens, transferToken } = useTokenStoreContext();
  const { _address, _balance, _network, getEthereumBalance, transfer } = useWalletContext();
  const { level } = useGasContext();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | false>(false);
  
  const {gasInfo, setGas} = useGasInfo(step, level);
  const { estimateGas } = useGasContext();

  const springProps = useSpring({
    opacity: _currentNavigation === "send" ? 1 : 0,
    transform:
      _currentNavigation === "send"
        ? "translateY(0%) scale(1)"
        : "translateY(-50%) scale(0.8)",
    config: config.wobbly,
  });

  const handlePullBalance = async () => {
    // wait 3s before pulling balance for erc20 & eth
    await new Promise(resolve => {
      setTimeout(resolve, 3000);
    });

    setTriggerBalanceUpdate(true);
    getEthereumBalance();
    setTimeout(() => {
      setTriggerBalanceUpdate(false);
    }, 15000);
  }

  const handleClearButton = (setFieldValueRef: any) => {
    setFieldValueRef("address", "");
    setStep(1);
  };

  if (_currentNavigation !== "send") {
    return null;
  }

  const initialTokenShouldBeMinimaIfExists = tokens.find(
    (token) => token.address === _defaults["wMinima"][_network]
  );
  return (
    _currentNavigation === "send" &&
    createPortal(
      <Dialog>
        <div className="h-[100vh_-_64px] grid items-start mt-[80px]">
          <animated.div style={springProps}>
            <div className=" bg-white shadow-lg  shadow-slate-300 dark:shadow-sm dark:bg-black w-[calc(100%_-_16px)] md:w-full p-4 px-0 rounded mx-auto">
              <h3 className="px-4 pb-3 text-lg font-bold text-center">
                {step === 1 && "Send to"}
                {step === 2 && "Enter amount"}
                {step === 3 && "Transaction details"}
                {step === 4 && !error && "Transaction Receipt"}
                {step === 4 && error && "Something went wrong"}
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
                          message: "Enter a valid Ethereum address",
                        });
                      }
                    }),
                  amount: yup
                    .string()
                    .matches(/^\d*\.?\d+$/, "Enter a valid number")
                    .required("Amount is required")
                    .test("has funds", function (val) {
                      const { path, createError, parent } = this;

                      try {
                        if (
                          parent.asset.type === "ether" &&
                          (new Decimal(val).gt(_balance) || new Decimal(val).isZero())
                        ) {
                          throw new Error("Insufficient funds");
                        }
        
                        const assetBalance = parent.asset.balance;
                        const decimals = parent.asset.name === "Tether" && _network !== 'sepolia' ? 6 : 18;
                        if (
                          parent.asset.type === "erc20" &&
                          (new Decimal(parseUnits(val, decimals).toString()).gt(
                            assetBalance
                          ) ||
                            new Decimal(assetBalance).isZero())
                        ) {
                          throw new Error("Insufficient funds 2");
                        }

                        return true;
                      } catch (error) {
                        if (error instanceof Error) {
                          return createError({
                            path,
                            message: "Insufficient funds",
                          });
                        }

                        createError({
                          path,
                          message: "Invalid amount",
                        });
                      }
                    })
                    .test("has no gas", function (val) {
                      const { path, parent, createError } = this;

                      try {       
                        if (step < 2) {
                          return true;
                        }        
                        
                        if (isNaN(parseInt(val))) {
                          throw new Error("Enter a valid number");
                        }

                        if (gasInfo === null) {
                          throw new Error("Gas API not available");
                        }

                        if (new Decimal(val).isZero()) {
                          throw new Error("Enter a valid amount");
                        }

                        if (new Decimal(_balance).isZero()) {
                          throw new Error("Not enough ETH available to pay for gas.");
                        }                        

                        return estimateGas(val, parent.address, parent.asset).then(async (gasUnits) => {
                          
                          const { suggestedMaxFeePerGas, suggestedMaxPriorityFeePerGas } = gasInfo;
                          // calculate the transfer price
                          const calculateGasPrice = await utils.calculateGasFee(gasUnits!, suggestedMaxFeePerGas, suggestedMaxPriorityFeePerGas);


                          if (parent.asset.type === "ether") {
                            const total = new Decimal(calculateGasPrice!.finalGasFee).plus(val);
                            if (new Decimal(total).greaterThan(_balance)) {
                              return createError({path, message: "Not enough ETH available to pay for gas."});
                            }
                          } else {
                            if (new Decimal(calculateGasPrice!.finalGasFee).greaterThan(_balance)) {
                              return createError({path, message: "Not enough ETH available to pay for gas."});
                            }
                          }

                          return true;
                        });                      
                      } catch (error) {
                        if (error instanceof Error) {
                          return createError({
                            path,
                            message:
                              error.message,
                          });
                        }

                        createError({
                          path, message: "Something went wrong"
                        })
                      }
                    }),
                })}
                initialValues={{
                  amount: "",
                  gas: null,
                  asset: initialTokenShouldBeMinimaIfExists
                    ? initialTokenShouldBeMinimaIfExists
                    : {
                        name: _defaultNetworks[_currentNetwork].name,
                        symbol: _defaultNetworks[_currentNetwork].symbol,
                        balance: _balance,
                        address: "",
                        decimals: _defaultNetworks[_currentNetwork].decimals,
                        type: "ether",
                      },
                  address: "",
                  receipt: null,
                  gasPaid: "",
                }}
                onSubmit={async (
                  { amount, address, asset },
                  { setFieldValue }
                ) => {
                  setError(false);
                  setLoading(true);
                  try {
                    if (!gasInfo) {
                      throw new Error("Gas API not available");
                    }

                    const { suggestedMaxFeePerGas, suggestedMaxPriorityFeePerGas } = gasInfo;
                    const gasUnits = await estimateGas(amount, address, asset);
                    const calculateGasPrice = await utils.calculateGasFee(gasUnits!, suggestedMaxFeePerGas, suggestedMaxPriorityFeePerGas);

                    if (asset.type === "ether") {

                      const txResponse = await transfer(address, amount, calculateGasPrice!);

                      setStep(4);
                      setFieldValue("receipt", txResponse);
                      setFieldValue("gasPaid", calculateGasPrice!.finalGasFee);

                      await handlePullBalance();
                    } else {
                      // handle ERC 20 transfers
                      const txResponse = await transferToken(
                        asset.address,
                        address,
                        amount,
                        calculateGasPrice!,
                        asset.address === '0xb3BEe194535aBF4E8e2C0f0eE54a3eF3b176703C' ? 18 : asset.decimals
                      );


                      setStep(4);
                      setFieldValue("gasPaid", calculateGasPrice!.finalGasFee);
                      setFieldValue("receipt", txResponse);
                    }

                    await handlePullBalance();
                  } catch (error: any) {
                    console.error(error);
                    // display error message
                    setStep(4);
                    setError(
                      error && error.shortMessage
                        ? error.shortMessage
                        : "Transaction failed, please try again."
                    );
                  } finally {
                    setLoading(false);
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
                  errors,
                  values,
                  isValid,
                  dirty,
                  resetForm,
                }) => (
                  <form onSubmit={handleSubmit}>
                    {step === 1 && (
                      <div className="mb-4">
                        <div className="px-4">
                          <input
                            disabled={isSubmitting}
                            required
                            id="address"
                            name="address"
                            type="text"
                            onBlur={handleBlur}
                            placeholder="Recipient public (0x) Address or ENS name"
                            className={`w-full bg-gray-100 bg-opacity-30 p-4 dark:bg-[#1B1B1B] mb-2 ${
                              dirty && errors.address
                                ? "outline !outline-red-500"
                                : "focus:outline-violet-300"
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

                          {dirty && errors.address && (
                            <div className="my-2 bg-red-600 text-white font-bold rounded p-2">
                              {errors.address}
                            </div>
                          )}
                        </div>
                        <AddressBook setStep={setStep} />
                      </div>
                    )}
                    {step === 2 && (
                      <div>
                        <div className="px-4">
                          <div className="rounded grid grid-cols-[1fr_auto] items-center bg-gray-100 bg-opacity-30 p-4 outline outline-violet-300">
                            <input
                              disabled={isSubmitting}
                              required
                              {...getFieldProps("address")}
                              type="text"
                              readOnly
                              placeholder="Recipient public (0x) Address or ENS name"
                              className={`w-full bg-transparent !outline-none dark:bg-[#1B1B1B]`}
                            />
                            <Cross
                              dismiss={() => handleClearButton(setFieldValue)}
                            />
                          </div>
                        </div>
                        <div className="mt-2 mx-4">
                          <SelectAsset />
                        </div>
                        <div className="px-4 py-3">
                          <InputWrapper
                            errors={
                              errors &&
                              errors.amount ?
                              errors.amount : false
                            }
                            wrapperStyle="mt-2"
                            inputProps={{
                              placeholder: "0.0",
                              ...getFieldProps("amount"),
                            }}
                            label="Amount"
                            action={
                              <div className="flex items-center justify-center flex-col">
                                <p className="font-bold text-xs">
                                  {values.asset.symbol}
                                </p>
                                <button
                                  onClick={() =>
                                    setFieldValue(
                                      "amount",
                                      values.asset.type !== "erc20"
                                        ? values.asset.balance
                                        : formatUnits(values.asset.balance, values.asset.decimals)
                                    )
                                  }
                                  type="button"
                                  className="!outline-none p-0 m-0 tracking-wide hover:text-black dark:text-teal-300 dark:hover:text-teal-500 font-bold"
                                >
                                  MAX
                                </button>
                              </div>
                            }
                          />

                        </div>
                      </div>
                    )}
                    {step === 3 && (
                      <div className="pb-4">
                        <div className="mt-4 mb-4 bg-teal-500 px-4 flex items-center justify-between">
                          <AddressBookContact address={_address!} />
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
                            <p className="font-mono">{values.asset.name}</p>
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


                          {errors.amount && (
                            <p className="mt-4 mx-3 bg-red-600 text-white font-bold rounded p-2">
                              {errors.amount}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {step === 4 && values.receipt && (
                      <TransactionReceiptCard
                        recipient={values.address}
                        asset={values.asset}
                        receipt={values.receipt}
                        gasPaid={values.gasPaid}
                        amountSent={values.amount}
                      />
                    )}
                    <div
                      className={` mt-8 ${step === 1 || step === 4 ? "" : ""}`}
                    >
                      <nav>
                        {step === 1 && (
                          <div className="px-4">
                            <button
                              onClick={() => handleNavigation("balance")}
                              className="w-full bg-[#1B1B1B] hover:bg-opacity-80 text-white font-bold tracking-wider py-4"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                        {step === 2 && (
                          <div className="px-4 grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setStep(1)}
                              className="w-full bg-[#1B1B1B] hover:bg-opacity-80 text-white font-bold tracking-wider py-4 disabled:text-opacity-10 disabled:bg-opacity-10"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => setStep(3)}                              
                              disabled={errors && (!!errors.amount || !!errors.address)}
                              className="bg-violet-500 text-white font-bold tracking-wide dark:bg-violet-500 dark:text-black hover:bg-opacity-80 disabled:bg-opacity-50"
                            >
                              Next
                            </button>
                          </div>
                        )}
                        {step === 3 && (
                          <div className="px-4 grid grid-cols-2 gap-2">
                            <button
                              disabled={loading}
                              type="button"
                              onClick={() => {
                                setStep(1);
                                setGas(null);
                                resetForm();
                              }}
                              className="w-full bg-[#1B1B1B] hover:bg-opacity-80 text-white font-bold tracking-wider py-4 disabled:text-opacity-10 disabled:bg-opacity-10"
                            >
                              Reject
                            </button>
                            <button
                              type="submit"
                              disabled={loading || !isValid || !gasInfo}                              
                              className={`bg-violet-500 text-white font-bold tracking-wide dark:bg-violet-500 dark:text-black hover:bg-opacity-80 disabled:bg-opacity-10 ${!gasInfo && "disabled:bg-opacity-50"}`}
                            >
                              {loading && "Sending..."}
                              {!loading && !gasInfo && "Fetching Gas"}
                              {!loading && gasInfo && "Send"}
                            </button>
                          </div>
                        )}
                        {step === 4 && error && (
                          <p className="break-all text-center text-red-500">
                            {error}
                          </p>
                        )}
                        {step === 4 && error && (
                          <div className="px-4 grid grid-cols-1 mt-4">
                            <button
                              type="button"
                              onClick={() => {
                                setStep(3);
                              }}
                              className="w-full bg-[#1B1B1B] hover:bg-opacity-80 text-white font-bold tracking-wider py-4 disabled:text-opacity-10 disabled:bg-opacity-10"
                            >
                              Back
                            </button>
                          </div>
                        )}
                        {step === 4 && !error && (
                          <div className="px-4 grid grid-cols-1">
                            <button
                              type="button"
                              onClick={async () => {
                                setStep(1);
                                setGas(null);
                                resetForm();
                                handleNavigation("balance");
                                await handlePullBalance();
                              }}
                              className="w-full bg-[#1B1B1B] hover:bg-opacity-80 text-white font-bold tracking-wider py-4 disabled:text-opacity-10 disabled:bg-opacity-10"
                            >
                              Dismiss
                            </button>
                          </div>
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