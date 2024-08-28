import { Formik } from "formik";
import FieldWrapper from "./FieldWrapper";
import SwapDirection from "./SwapDirection";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";
import * as yup from "yup";
import { SUPPORTED_CHAINS, Token } from "@uniswap/sdk-core";

import { useContext, useEffect, useState } from "react";
import { appContext } from "../../AppContext";
import Decimal from "decimal.js";
import {
  Contract,
  formatUnits,
  MaxUint256,
  parseUnits,
  Transaction,
} from "ethers";
import GasFeeEstimator from "./GasFeeEstimator";
import { createDecimal } from "../../utils";
import ReviewSwap from "./ReviewSwap";
import useAllowanceChecker from "../../hooks/useAllowanceChecker";
import Allowance from "./Allowance";
import RefreshIcon from "../UI/Icons/RefreshIcon";

import ABI_ERC20 from "../../abis/ERC20.json";
import Settings from "./Settings";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import Eth, { ledgerService } from "@ledgerhq/hw-app-eth";

const SwapWidget = () => {
  // Check if we have enough allowance to then show the appropriate button..
  useAllowanceChecker();

  const { _poolContract, _network, _address } = useWalletContext();

  const [tokenA, setTokenA] = useState<{
    token: Token;
    balance: string;
  } | null>(null);
  const [tokenB, setTokenB] = useState<{
    token: Token;
    balance: string;
  } | null>(null);

  const {
    _provider,
    _userAccounts,
    promptAllowanceApprovalModal,
    swapDirection,
    _allowanceLock,
    setPromptAllowance,
  } = useContext(appContext);

  const { _wallet, _balance, callBalanceForApp } = useWalletContext();

  const [step, setStep] = useState(1);
  const [ledgerContext, setLedgerContext] = useState<false | "waiting" | "rejected" | "success">(false);
  const [error, setError] = useState<false | string>(false);

  useEffect(() => {
    const wminima = new Token(
      SUPPORTED_CHAINS["1"],
      "0x669c01CAF0eDcaD7c2b8Dc771474aD937A7CA4AF",
      18,
      "WMINIMA",
      "Wrapped Minima"
    );
    const usdt = new Token(
      SUPPORTED_CHAINS["1"],
      "0xdac17f958d2ee523a2206206994597c13d831ec7",
      6,
      "USDT",
      "Tether"
    );

    (async () => {
      const contractWminima = new Contract(
        wminima.address,
        ABI_ERC20,
        _provider
      );
      const contractTether = new Contract(usdt.address, ABI_ERC20, _provider);
      const balanceWminima = await contractWminima.balanceOf(_address);
      const balanceTether = await contractTether.balanceOf(_address);

      if (swapDirection === "usdt") {
        setTokenA({ token: wminima, balance: balanceWminima });
        setTokenB({ token: usdt, balance: balanceTether });
      } else {
        setTokenA({ token: usdt, balance: balanceTether });
        setTokenB({ token: wminima, balance: balanceWminima });
      }
    })();
  }, [swapDirection]);

  if (_network !== "mainnet") {
    return (
      <p className="text-xs opacity-80 text-center">
        This feature is only available on mainnet.
      </p>
    );
  }

  return tokenA && tokenB ? (
    <Formik
      validationSchema={yup.object().shape({
        inputAmount: yup
          .string()
          .required("Enter an amount")
          .matches(/^\d+(\.\d+)?$/, "Invalid amount")
          .test("check for insufficient funds", async function (val) {
            const { path, parent, createError } = this;

            if (!val || val.length === 0)
              return createError({ path, message: "Enter an amount" });

            try {
              const parseBalance = formatUnits(
                tokenA.balance,
                tokenA.token.decimals
              );

              if (new Decimal(parseBalance.toString()).isZero()) {
                return createError({
                  path,
                  message: "Insufficient funds",
                });
              }

              const decimalVal = createDecimal(val);
              if (decimalVal === null) {
                throw new Error("Invalid amount");
              }

              if (decimalVal.gt(MaxUint256.toString())) {
                throw new Error("You exceeded the max amount");
              }

              if (decimalVal.greaterThan(parseBalance.toString())) {
                throw new Error("Insufficient funds");
              }

              if (
                new Decimal(val).decimalPlaces() > parent.tokenA.token.decimals
              ) {
                throw new Error("Too many decimals");
              }

              return true;
            } catch (error) {
              if (error instanceof Error) {
                return createError({
                  path,
                  message: error.message,
                });
              }

              return false;
            }
          }),
        gas: yup
          .string()
          .required("Gas is required")
          .test("has sufficient funds to pay for gas", function (val) {
            const { path, createError } = this;

            if (!val || val.length === 0) return false;

            try {
              // We check whether the user has enough funds to pay for gas.
              if (new Decimal(_balance).isZero()) {
                return createError({
                  path,
                  message: "Insufficient funds, low on ETH for gas",
                });
              }
              const decimalVal = createDecimal(val);
              if (decimalVal === null) {
                throw new Error("Invalid gas amount");
              }

              // spendAmount is in Ethereum..

              if (
                new Decimal(parseUnits(val, "gwei").toString()).greaterThan(
                  parseUnits(_balance, "ether").toString()
                )
              ) {
                throw new Error("Insufficient funds, low on ETH for gas");
              }

              return true;
            } catch (error: any) {
              // console.error(error);
              if (error instanceof Error) {
                return createError({
                  path,
                  message: error.message,
                });
              }

              return false;
            }
          }),
      })}
      initialValues={{
        inputAmount: "",
        outputAmount: "",
        inputMode: false,
        tx: null,
        receipt: null,
        gas: null,
        locked: null,
        tokenA: tokenA,
        tokenB: tokenB,
      }}
      onSubmit={async ({ tx, gas }, { setFieldValue, setSubmitting }) => {
        console.log("Submitting...");
        setStep(3); // Set Global form state to submission
        const current = _userAccounts.find((a) => a.current);

        try {
          if (!tx) {
            throw new Error(
              "Construction of transaction failed, please re-submit form."
            );
          }

          if (current.type === "ledger") {            
            setLedgerContext("waiting");

            const transport = await TransportWebUSB.create();

            const ethApp = new Eth(transport);

            if (!gas) {
              throw new Error("Gas API not available");
            }

            console.log("tx", tx);

            const serializedTx = Transaction.from(tx).unsignedSerialized;

            // Resolve and sign the transaction
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

            // Construct the signed transaction
            const signedTx = Transaction.from({
              ...tx as object,
              signature: {
                r: `0x${signature.r}`,
                s: `0x${signature.s}`,
                v: parseInt(signature.v, 16),
              },
            });

            console.log('SignedTx', signedTx);
            setLedgerContext("success");

            await new Promise((resolve) => setTimeout(resolve, 10000000));
            // rid of ledger screen confirmation
            setLedgerContext(false);
            // show swapping screen like normal...
            setStep(3);
            await new Promise((resolve) => setTimeout(resolve, 1000000));



            // reset form, show success etc. etc.
          }
        } catch (error) {
          console.error(error);
          if (error instanceof Error) {
            // Rejection of ledger signature
            if (error.message.includes("Ledger device: Condition of use not satisfied (denied by the user?)")) {
              setLedgerContext('rejected');
            }

            return setError(error.message as string);
          }

          setError("Your submission failed, please try again later.");
        }
        // try {
        //   setFieldValue("locked", true);
        //   const res = await _wallet!.sendTransaction(tx);

        //   const receipt = await res.wait();
        //   setFieldValue("receipt", receipt);

        //   setStep(4);
        //   await callBalanceForApp();
        // } catch (error) {
        //   console.error(error);
        //   setStep(5);
        //   if (error instanceof Error) {
        //     return setError(error.message);
        //   }

        //   return setError(JSON.stringify(error));
        // }
      }}
    >
      {({
        values,
        isValid,
        errors,
        handleSubmit,
        handleBlur,
        setFieldValue,
      }) => {
        const { tokenA, tokenB } = values;

        if (!_poolContract) {
          return <p>Loading Pool...</p>;
        }

        return (
          <>
            <Allowance />

            <Settings />

            <form
              onSubmit={handleSubmit}
              className="relative border border-neutral-500 dark:border-[#1B1B1B] rounded p-3"
            >
              <>
                <FieldWrapper
                  onFocus={() => setFieldValue("inputMode", true)}
                  handleBlur={handleBlur}
                  disabled={!!values.locked}
                  type="input"
                  currency={tokenA}
                />

                <SwapDirection />
                <FieldWrapper
                  onFocus={() => setFieldValue("inputMode", false)}
                  handleBlur={handleBlur}
                  disabled={!!values.locked}
                  extraClass="mt-1"
                  type="output"
                  currency={tokenB}
                />

                {values.locked !== null && values.locked && (
                  <div className="mt-8">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        promptAllowanceApprovalModal();
                      }}
                      className="py-4 disabled:bg-gray-800 disabled:text-gray-600 hover:bg-opacity-90 bg-purple-300 text-black text-lg w-full font-bold my-2 rounded-sm"
                    >
                      Approve {tokenA.token.symbol}
                    </button>
                  </div>
                )}

                {!values.locked && errors.inputAmount && (
                  <div className="mt-8">
                    <button
                      disabled={!isValid}
                      type="submit"
                      className="font-bold bg-transparent border border-neutral-500 dark:border-none dark:bg-[#1B1B1B] w-full py-4 tracking-wide dark:text-neutral-100 dark:disabled:text-neutral-500 rounded-full"
                    >
                      {errors.inputAmount ? errors.inputAmount : "Error"}
                    </button>
                  </div>
                )}

                {!errors.inputAmount &&
                  createDecimal(values.inputAmount) !== null &&
                  !new Decimal(values.inputAmount).isZero() &&
                  !_allowanceLock && (
                    <div className="mt-8">
                      <button
                        disabled={!!errors.inputAmount}
                        onClick={() => setStep(2)}
                        type="button"
                        className="font-bold text-neutral-100 bg-neutral-800 border border-neutral-500 dark:border-none dark:bg-[#1B1B1B] w-full py-4 tracking-wide dark:text-neutral-100 dark:disabled:text-neutral-500 rounded-full"
                      >
                        {errors.inputAmount ? errors.inputAmount : "Review"}
                      </button>

                      <GasFeeEstimator />
                    </div>
                  )}

                {_allowanceLock && (
                  <button
                    onClick={() => setPromptAllowance(true)}
                    type="button"
                    className="mt-4 w-full bg-violet-500 p-3 font-bold text-white dark:text-black trailing-wider"
                  >
                    Approve allowances
                  </button>
                )}
              </>

              <ReviewSwap ledgerContext={ledgerContext} step={step} setStep={setStep} />
            </form>
          </>
        );
      }}
    </Formik>
  ) : (
    <div className="flex flex-col justify-center items-center mt-16">
      <span className="animate-spin dark:text-neutral-300">
        <RefreshIcon fill="currentColor" />
      </span>
      <p className="text-center text-xs pt-1 dark:text-neutral-400">
        Refreshing your experience...
      </p>
    </div>
  );
};

export default SwapWidget;
