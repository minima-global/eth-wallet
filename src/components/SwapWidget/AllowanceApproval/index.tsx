import { useContext, useEffect, useState } from "react";
import { appContext } from "../../../AppContext";
import AnimatedDialog from "../../UI/AnimatedDialog";
import Cross from "../../UI/Cross";
import { Formik, useFormikContext } from "formik";
import ApproveFieldWrapper from "./ApproveFieldWrapper";
import { SUPPORTED_CHAINS, Token } from "@uniswap/sdk-core";
import { getTokenTransferApproval } from "../libs/getTokenTransferApproval";
import { useWalletContext } from "../../../providers/WalletProvider/WalletProvider";
import { MaxUint256, NonceManager } from "ethers";
import useTokenApprovals from "../../../hooks/useTokenApprovals";
import Decimal from "decimal.js";
import { createDecimal } from "../../../utils";

import * as yup from "yup";
import ReviewApproval from "./ReviewApproval";
import GasFeeEstimator from "./GasFeeEstimator";

const AllowanceApproval = ({ token }) => {
  const formik: any = useFormikContext();
  const { _wallet, _address } = useWalletContext();
  const { _promptAllowanceApprovalModal, promptAllowanceApprovalModal, setTriggerBalanceUpdate } =
    useContext(appContext);

  const [step, setStep] = useState(1);
  const [error, setError] = useState<false | string>();

  const checkAllowances = useTokenApprovals();
  const { setFieldValue } = formik;
  const { inputAmount } = formik.values;

  useEffect(() => {
    const inputTokenAddress = formik.values.input.address;

    (async () => {
      if (
        !inputAmount ||
        createDecimal(inputAmount) === null ||
        createDecimal(inputAmount)?.isZero() || createDecimal(formik.values.input.balance)?.isZero()
      ) {
        setFieldValue("locked", false);
      }

      if (
        inputAmount &&
        createDecimal(inputAmount) !== null &&
        new Decimal(inputAmount).gt(0)
      ) {
        const state = await checkAllowances(
          formik.values.input.decimals,
          inputTokenAddress,
          formik.values.inputAmount
        );

        setFieldValue("locked", state);
      }
    })();
  }, [formik.values]);

  return (
    <AnimatedDialog
      position="items-center"
      isOpen={_promptAllowanceApprovalModal}
      onClose={promptAllowanceApprovalModal}
      extraClass="z-[25]"
      dialogStyles="!shadow-sm !shadow-gray-600"
    >
      <div className="px-4 grid grid-cols-[1fr_auto]">
        <div className="text-center">
          <h3 className="font-bold">Approve Spend To Swap Contract</h3>{" "}
        </div>
        <Cross dismiss={promptAllowanceApprovalModal} />
      </div>
      <div className="my-4 px-4">
        <Formik
          validationSchema={yup.object().shape({
            amount: yup
              .string()
              .required("Enter an amount")
              .matches(/^\d+(\.\d+)?$/, "Invalid amount")
              .test("check for insufficient funds", function (val) {
                const { path, createError } = this;

                if (!val || val.length === 0) return false;

                try {
                  if (createDecimal(val) === null) {
                    throw new Error("Invalid amount");
                  }

                  if (createDecimal(val)?.times(10**token.decimals).greaterThan(MaxUint256.toString())) {
                    throw new Error("Exceeded Max Amount");
                  }

                  return true;
                } catch (error: any) {
                  console.error(error);
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
            amount: MaxUint256.toString(),
            gas: null,
            receipt: null
          }}
          onSubmit={async ({ amount }, { resetForm }) => {

            const _tokenA = new Token(
              SUPPORTED_CHAINS["1"],
              formik.values.input.address,
              formik.values.input.decimals,
              formik.values.input.symbol,
              formik.values.input.name
            );

            setStep(3);
            try {
              const nonceManager = new NonceManager(_wallet!);
              await getTokenTransferApproval(
                _tokenA,
                amount,
                nonceManager, // signer
                _address!
              );

              setStep(4);
              setTimeout(() => {
                setTriggerBalanceUpdate((prevState) => !prevState);
              }, 4000);              
              
              resetForm();
            } catch (error) {
              setStep(5);
              if (error instanceof Error) {
                return setError(error.message);
              }

              return setError("Transaction rejected!");
            }
          }}
        >
          {({ handleSubmit, isSubmitting, isValid, errors, submitForm }) => (
            <form onSubmit={handleSubmit}>
              <ApproveFieldWrapper disabled={isSubmitting} token={token} />

              <button
                disabled={isSubmitting || !isValid}
                onClick={() => setStep(2)}
                type="button"
                className="py-4 disabled:bg-gray-800 disabled:text-gray-600 hover:bg-opacity-90 bg-teal-300 text-white dark:text-black text-lg w-full font-bold my-2"
              >
                {errors.amount ? errors.amount : "Review Approval"}
              </button>

              <GasFeeEstimator
                token={
                  new Token(
                    SUPPORTED_CHAINS["1"],
                    formik.values.input.address,
                    formik.values.input.decimals,
                    formik.values.input.symbol,
                    formik.values.input.name
                  )
                }
              />

              <p className="text-sm text-slate-600 dark:text-yellow-500 my-2 text-center">
                Set to maximum so you don't have to do this everytime you want
                to swap.
              </p>

              <ReviewApproval
                token={token}
                step={step}
                setStep={setStep}
                submitForm={submitForm}
                error={error}
              />
            </form>
          )}
        </Formik>
      </div>
    </AnimatedDialog>
  );
};

export default AllowanceApproval;
