import { useContext, useEffect, useState } from "react";
import { appContext } from "../../AppContext";
import { Formik } from "formik";

import GasEstimation from "../GasFeeEstimate";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";
import AddressBook from "../AddressBook";
import ConversionRateUSD from "../ConversionRateUSD";
import AddressBookContact from "../AddressBookContact";

import {
  formatUnits,
  getAddress,
  Interface,
  parseEther,
  parseUnits,
  Transaction,
} from "ethers";

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

import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import Eth, { ledgerService } from "@ledgerhq/hw-app-eth";
import TransferIcon from "../UI/Icons/TransferIcon";
import RefreshIcon from "../UI/Icons/RefreshIcon";
import AnimatedDialog from "../UI/AnimatedDialog";

const Send = () => {
  const {
    _currentNavigation,
    handleNavigation,
    _defaultNetworks,
    _currentNetwork,
    _userAccounts,
    _provider,
    _currentAccount,
  } = useContext(appContext);
  const { tokens, transferToken } = useTokenStoreContext();
  const {
    _chainId,
    _address,
    _balance,
    _network,
    callBalanceForApp,
    transfer,
  } = useWalletContext();
  const { level } = useGasContext();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | false>(false);

  const { gasInfo, setGas } = useGasInfo(step, level);
  const { estimateGas } = useGasContext();

  const [ledgerContext, setLedgerContext] = useState<
    false | "waiting" | "rejected" | "accepted"
  >(false);

  const [initialTokenShouldBeMinimaIfExists, setInitialToken] = useState<any>(null);


  const handleClearButton = (setFieldValueRef: any) => {
    setFieldValueRef("address", "");
    setStep(1);
  };

  useEffect(() => {
    if (_currentNavigation === 'send') {
      setInitialToken(tokens.find(
        (token) =>
          token.address.toUpperCase() ===
          _defaults["wMinima"][_network].toUpperCase()))
    }
  }, [_currentNavigation]);

  
  return (
    <AnimatedDialog
      display={_currentNavigation === "send"}
      dismiss={() => null}
    >
      <div className=" ">
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
                  const decimals =
                    (parent.asset.name === "Tether" ||
                      parent.asset.name === "Tether USD") &&
                    _network !== "sepolia"
                      ? 6
                      : 18;
                  if (
                    parent.asset.type === "erc20" &&
                    (new Decimal(parseUnits(val, decimals).toString()).gt(
                      assetBalance
                    ) ||
                      new Decimal(assetBalance).isZero())
                  ) {
                    throw new Error("Insufficient funds");
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

                  return estimateGas(val, parent.address, parent.asset).then(
                    async (gasUnits) => {
                      const {
                        suggestedMaxFeePerGas,
                        suggestedMaxPriorityFeePerGas,
                      } = gasInfo;
                      // calculate the transfer price
                      const calculateGasPrice = await utils.calculateGasFee(
                        gasUnits!,
                        suggestedMaxFeePerGas,
                        suggestedMaxPriorityFeePerGas
                      );

                      if (parent.asset.type === "ether") {
                        const total = new Decimal(
                          calculateGasPrice!.finalGasFee
                        ).plus(val);
                        if (new Decimal(total).greaterThan(_balance)) {
                          return createError({
                            path,
                            message: "Not enough ETH available to pay for gas.",
                          });
                        }
                      } else {
                        if (
                          new Decimal(
                            calculateGasPrice!.finalGasFee
                          ).greaterThan(_balance)
                        ) {
                          return createError({
                            path,
                            message: "Not enough ETH available to pay for gas.",
                          });
                        }
                      }

                      return true;
                    }
                  );
                } catch (error) {
                  if (error instanceof Error) {
                    return createError({
                      path,
                      message: error.message,
                    });
                  }

                  createError({
                    path,
                    message: "Something went wrong",
                  });
                }
              }),
          })}
          initialValues={{
            amount: "",
            gas: null,
            asset: initialTokenShouldBeMinimaIfExists
              ? initialTokenShouldBeMinimaIfExists
              : {
                  name: _currentNetwork ? _defaultNetworks[_currentNetwork].name : null,
                  symbol: _currentNetwork ?  _defaultNetworks[_currentNetwork].symbol : null,
                  balance: _balance,
                  address: "",
                  decimals: _currentNetwork  ? _defaultNetworks[_currentNetwork].decimals : null,
                  type: "ether",
                },
            address: "",
            receipt: null,
            gasPaid: "",
          }}
          onSubmit={async ({ amount, address, asset }, { setFieldValue }) => {
            setError(false);
            setLoading(true);
            const current = _userAccounts.find((a) => a.current);

            try {
              if (!gasInfo) {
                throw new Error("Gas API not available");
              }

              const { suggestedMaxFeePerGas, suggestedMaxPriorityFeePerGas } =
                gasInfo;
              const gasUnits = await estimateGas(amount, address, asset);
              const calculateGasPrice = await utils.calculateGasFee(
                gasUnits!,
                suggestedMaxFeePerGas,
                suggestedMaxPriorityFeePerGas
              );

              // Account is a ledger a/c so we will use clear signatures
              if (current.type === "ledger") {
                // if (!ledgerTransport) {

                //   throw new Error("Please connect your ledger, unlock it and open the Ethereum application then try again.");
                // }
                const transport = await TransportWebUSB.create();

                const ethApp = new Eth(transport);

                if (!gasUnits || !calculateGasPrice) {
                  throw new Error("Gas API not available");
                }

                const unsignedTx = new Transaction();

                unsignedTx.to =
                  asset.type === "ether" ? address : asset.address; // Address of recipient for Ether or ERC-20 Contract Address
                unsignedTx.value =
                  asset.type === "ether" ? parseEther(amount) : BigInt(0);
                unsignedTx.gasLimit = gasUnits;
                unsignedTx.maxFeePerGas = parseUnits(
                  calculateGasPrice.baseFee,
                  "gwei"
                );
                unsignedTx.maxPriorityFeePerGas = parseUnits(
                  calculateGasPrice.priorityFee,
                  "gwei"
                );
                unsignedTx.chainId = _chainId ? BigInt(_chainId) : BigInt(1); // Mainnet ID; use appropriate chain ID for testnet or other networks
                unsignedTx.nonce = await _provider.getTransactionCount(
                  current.address
                ); // Method to get nonce
                unsignedTx.data =
                  asset.type === "erc20"
                    ? new Interface([
                        "function transfer(address to, uint256 value)",
                      ]).encodeFunctionData("transfer", [
                        address,
                        parseUnits(amount, asset.decimals),
                      ])
                    : "0x"; // No data for Ether transfer

                setLedgerContext("waiting");
                const serializedTx = unsignedTx.unsignedSerialized;
                const resolution = await ledgerService.resolveTransaction(
                  serializedTx.slice(2),
                  ethApp.loadConfig,
                  { erc20: true, externalPlugins: true }
                );
                const signature = await ethApp.signTransaction(
                  current.bip44Path,
                  serializedTx.slice(2),
                  resolution
                );
                unsignedTx.signature = {
                  r: "0x" + Buffer.from(signature.r),
                  s: "0x" + Buffer.from(signature.s),
                  v: "0x" + Buffer.from(signature.v),
                };

                unsignedTx.signature = {
                  r: `0x${signature.r}`,
                  s: `0x${signature.s}`,
                  v: `0x${signature.v}`,
                };

                const serializedSignedTx =
                  Transaction.from(unsignedTx).serialized;
                const txResponse = await _provider.broadcastTransaction(
                  serializedSignedTx
                );

                setStep(4);
                setFieldValue("receipt", txResponse);
                setFieldValue("gasPaid", calculateGasPrice!.finalGasFee);

                await callBalanceForApp();
              } else {
                // Non-Ledger accounts
                if (asset.type === "ether") {
                  const txResponse = await transfer(
                    address,
                    amount,
                    calculateGasPrice!
                  );

                  setStep(4);
                  setFieldValue("receipt", txResponse);
                  setFieldValue("gasPaid", calculateGasPrice!.finalGasFee);

                  await callBalanceForApp();
                } else {
                  // Handle ERC 20 transfers
                  const txResponse = await transferToken(
                    asset.address,
                    address,
                    amount,
                    calculateGasPrice!,
                    asset.decimals
                  );

                  setStep(4);
                  setFieldValue("gasPaid", calculateGasPrice!.finalGasFee);
                  setFieldValue("receipt", txResponse);
                }

                await callBalanceForApp();
              }
            } catch (error) {
              console.error(error);
              // Display error message
              setStep(4);

              if (error instanceof Error) {
                return setError(error.message);
              }

              setError("Transaction failed. Please try again.");
            } finally {
              setLoading(false);
              setLedgerContext(false);
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
            <form onSubmit={handleSubmit} className="mx-4 xs:mx-0">
              {step === 1 && (
                <div className="mb-4">
                  <div>
                    <input
                      disabled={isSubmitting}
                      required
                      id="address"
                      name="address"
                      type="text"
                      onBlur={handleBlur}
                      placeholder="Recipient public (0x) Address"
                      className={`w-full bg-neutral-100 placeholder:text-neutral-500 focus:outline-none p-4 dark:bg-[#1B1B1B] mb-2 ${
                        dirty && errors.address
                          ? "outline !outline-neutral-200"
                          : "focus:outline focus:outline-teal-100"
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
                      <div className="my-2 dark:text-neutral-300 text-sm font-bold rounded">
                        {errors.address}
                      </div>
                    )}
                  </div>
                  <AddressBook setStep={setStep} />
                </div>
              )}
              {step === 2 && (
                <div>
                  <div>
                    <div className="rounded grid grid-cols-[1fr_auto] items-center bg-teal-100 shadow-sm shadow-teal-100 dark:shadow-none dark:bg-[#1B1B1B] p-4">
                      <input
                        disabled={isSubmitting}
                        required
                        {...getFieldProps("address")}
                        type="text"
                        readOnly
                        placeholder="Recipient public (0x) Address"
                        className={`w-full pr-3 max-w truncate bg-transparent font-bold tracking-wide focus:outline-none`}
                      />
                      <Cross dismiss={() => handleClearButton(setFieldValue)} />
                    </div>
                  </div>
                  <div className="mt-2">
                    <SelectAsset />
                  </div>
                  <div className="py-3">
                    <InputWrapper
                      errors={errors && errors.amount ? errors.amount : false}
                      wrapperStyle="mt-2"
                      inputProps={{
                        placeholder: "0.0",
                        ...getFieldProps("amount"),
                      }}
                      label="Amount"
                      action={
                        <div className="flex items-center justify-center flex-col">
                          <p
                            className={`font-bold transition-all text-xs tracking-widest ${
                              (values.asset.type === "ether" &&
                                values.asset.balance === values.amount) ||
                              (values.asset.type === "erc20" &&
                                formatUnits(
                                  values.asset.balance,
                                  values.asset.decimals
                                ) === values.amount)
                                ? "!text-lg"
                                : ""
                            }`}
                          >
                            {values.asset.symbol}
                          </p>

                          {((values.asset.type === "ether" &&
                            values.asset.balance !== values.amount) ||
                            (values.asset.type === "erc20" &&
                              formatUnits(
                                values.asset.balance,
                                values.asset.decimals
                              ) !== values.amount)) && (
                            <button
                              onClick={() =>
                                setFieldValue(
                                  "amount",
                                  values.asset.type !== "erc20"
                                    ? values.asset.balance
                                    : formatUnits(
                                        values.asset.balance,
                                        values.asset.decimals
                                      )
                                )
                              }
                              type="button"
                              className="!outline-none p-0 m-0 tracking-wide transition-all hover:text-black dark:text-neutral-400 dark:hover:text-teal-500 font-bold"
                            >
                              MAX
                            </button>
                          )}
                        </div>
                      }
                    />
                  </div>
                </div>
              )}
              {step === 3 && (
                <div className="pb-4">
                  <div className="mt-4 mb-4 bg-teal-100 shadow-sm shadow-teal-200 dark:shadow-none dark:bg-[#1B1B1B] bg-opacity-10 px-2 flex justify-between items-center gap-1">
                    <AddressBookContact address={_address!} />
                    <span>
                      <TransferIcon fill="currentColor" size={32} />
                    </span>
                    <AddressBookContact contact address={values.address} />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mx-4">
                      <h3 className="font-bold">Asset</h3>
                      <p className="font-mono">{values.asset.name}</p>
                    </div>
                    <div className="flex justify-between items-center mx-4">
                      <h3 className="font-bold">Amount</h3>
                      <div className="text-right">
                        <p className="font-mono font-bold">{values.amount}</p>
                        <ConversionRateUSD
                          asset={values.asset}
                          amount={values.amount}
                        />
                      </div>
                    </div>

                    <GasEstimation />

                    {errors.amount && (
                      <p className="my-2 dark:text-neutral-300 text-sm font-bold rounded">
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
                className={`relative mt-8 ${
                  step === 1 || step === 4 ? "" : ""
                }`}
              >
                <div
                  className={`${
                    ledgerContext
                      ? "fixed left-0 right-0 bottom-0 top-0 flex items-center justify-center"
                      : "hidden"
                  }`}
                >
                  <div className="fixed backdrop-blur-sm left-0 right-0 top-0 bottom-0 z-[43] bg-neutral-200/50 dark:bg-black/50"></div>
                  <div className="z-[46] flex items-center justify-center flex-col text-sm gap-2">
                    <span>
                      <RefreshIcon
                        fill="currentColor"
                        extraClass="animate-spin"
                      />
                    </span>
                    Waiting for Ledger confirmation...
                  </div>
                </div>

                {step === 1 && (
                  <div>
                    <button
                      onClick={() => handleNavigation("balance")}
                      className="w-full bg-[#1B1B1B] text-white font-bold tracking-wider py-4"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                {step === 2 && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full bg-[#1B1B1B] text-white font-bold tracking-wider py-4 disabled:text-opacity-10 disabled:bg-opacity-10"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      disabled={errors && (!!errors.amount || !!errors.address)}
                      className="bg-violet-500 text-white font-bold tracking-wide dark:bg-violet-500 hover:dark:bg-violet-600 dark:text-black disabled:bg-opacity-50 dark:disabled:bg-opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
                {step === 3 && (
                  <div>
                    {_currentAccount && _currentAccount.type === "ledger" && (
                      <p className="bg-gray-100 dark:bg-neutral-900 dark:text-neutral-400 text-sm text-center mb-2 py-2">
                        Make sure your ledger is connected, unlocked and your
                        Ethereum App is open before clicking Send
                      </p>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        disabled={loading}
                        type="button"
                        onClick={() => {
                          setStep(1);
                          setGas(null);
                          resetForm();
                        }}
                        className="w-full bg-[#1B1B1B] text-white font-bold tracking-wider py-4 disabled:bg-opacity-10"
                      >
                        Reject
                      </button>
                      <button
                        type="submit"
                        disabled={loading || !isValid || !gasInfo}
                        className={`bg-violet-500 text-white font-bold tracking-wide 
                                            dark:bg-violet-500 dark:text-black 
                                            hover:bg-violet-600 
                                            hover:dark:bg-violet-600 
                                            disabled:bg-opacity-80 
                                            ${
                                              !gasInfo
                                                ? "disabled:bg-opacity-50"
                                                : ""
                                            } 
                                            dark:disabled:bg-opacity-50`}
                      >
                        {loading ? "Sending..." : null}
                        {!loading && !gasInfo ? "Fetching Gas" : null}
                        {!loading && gasInfo ? "Send" : null}
                      </button>
                    </div>
                  </div>
                )}
                {step === 4 && error && (
                  <div className="my-16">
                    <p className="my-2 text-sm font-bold rounded text-center text-neutral-600 dark:text-neutral-400 break-all">
                      {error}
                    </p>
                  </div>
                )}
                {step === 4 && error && (
                  <div className="grid grid-cols-1 mt-4">
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
                  <div className="grid grid-cols-1">
                    <button
                      type="button"
                      onClick={async () => {
                        setStep(1);
                        setGas(null);
                        resetForm();
                        handleNavigation("balance");
                        await callBalanceForApp();
                      }}
                      className="w-full bg-[#1B1B1B] hover:bg-opacity-80 text-white font-bold tracking-wider py-4 disabled:text-opacity-10 disabled:bg-opacity-10"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </form>
          )}
        </Formik>
      </div>
    </AnimatedDialog>
  );
};

export default Send;
