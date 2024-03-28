import { useContext, useEffect, useState } from "react";
import { appContext } from "../../AppContext";
import AnimatedDialog from "../UI/AnimatedDialog";
import Cross from "../UI/Cross";
import { Formik, useFormikContext } from "formik";
import ApproveFieldWrapper from "./ApproveFieldWrapper";
import { SUPPORTED_CHAINS, Token } from "@uniswap/sdk-core";
import { getTokenTransferApproval } from "../SwapWidget/libs/getTokenTransferApproval";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";
import { MaxUint256, NonceManager } from "ethers";
import useTokenApprovals from "../../hooks/useTokenApprovals";
import Decimal from "decimal.js";
import { createDecimal } from "../../utils";

import * as yup from "yup";


const AllowanceApproval = ({ token }) => {
  const formik: any = useFormikContext();
  const { _wallet, _address } = useWalletContext();
  const {    
    _promptAllowanceApprovalModal,
    promptAllowanceApprovalModal,
  } = useContext(appContext);

  const [step, setStep] = useState(0);
  const [error, setError] = useState<false|string>();

  const checkAllowances = useTokenApprovals();
  const { setFieldValue } = formik;
  const { inputAmount } = formik.values;

  useEffect(() => {
    const inputTokenAddress = formik.values.input.address;

    (async () => {
      
      if (!inputAmount || createDecimal(inputAmount) === null || createDecimal(inputAmount)?.isZero()) {
        console.log('seting to false..');
        setFieldValue("locked", false);
      }

      if (
        inputAmount &&
        createDecimal(inputAmount) !== null &&
        new Decimal(inputAmount).gt(0)
      ) {
        const state = await checkAllowances(
          inputTokenAddress,
          formik.values.inputAmount
        );
        console.log('setting locked state to ' + state);
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
                const { path, parent, createError } = this;
  
                if (!val || val.length === 0) return false;
  
                try {
                  if (createDecimal(val) === null) {
                    throw new Error("Invalid amount");
                  }
                  
                  if (createDecimal(val)?.greaterThan(MaxUint256.toString())) {
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
          }}
          onSubmit={async ({ amount }, {resetForm, setStatus}) => {
            setStatus(undefined);
            const _tokenA = new Token(
              SUPPORTED_CHAINS["1"],
              formik.values.input.address,
              formik.values.input.decimals,
              formik.values.input.symbol,
              formik.values.input.name
            );

            try {
              const nonceManager = new NonceManager(_wallet!);
              const tokenApproval = await getTokenTransferApproval(
                _tokenA,
                amount,
                nonceManager, // signer
                _address!
              );
              
              console.log("SUCCESS", tokenApproval);

              resetForm();
              setStatus("Allowance approved!");
              
            } catch (error) {
              if (error instanceof Error) {
                return setStatus(error.message);
              }

              return setStatus("Transaction rejected!");
            }
          }}
        >
          {({ handleSubmit, isSubmitting, isValid, errors, status }) => (
            <form onSubmit={handleSubmit}>
              <ApproveFieldWrapper disabled={isSubmitting} token={token} />

              {status && <p className="break-all my-2">{status}</p>}
              <button
                disabled={isSubmitting || !isValid}
                type="submit"
                className="py-4 disabled:bg-gray-800 disabled:text-gray-600 hover:bg-opacity-90 bg-teal-300 text-black text-lg w-full font-bold my-2"
              >
                {errors.amount ? errors.amount : "Approve"}
              </button>
              <p className="text-sm text-yellow-500 my-2 text-center">
                Set to maximum so you don't have to do this everytime you want
                to swap.
              </p>
            </form>
          )}
        </Formik>
      </div>
    </AnimatedDialog>
  );
};

export default AllowanceApproval;
