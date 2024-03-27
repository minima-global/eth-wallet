import { useContext, useEffect } from "react";
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

const AllowanceApproval = ({ token, setApproval }) => {
  const formik: any = useFormikContext();
  const { _wallet, _address } = useWalletContext();
  const {    
    _promptAllowanceApprovalModal,
    promptAllowanceApprovalModal,
  } = useContext(appContext);

  const checkAllowances = useTokenApprovals();

  useEffect(() => {
    const inputTokenAddress = formik.values.input.address;

    (async () => {
      if (
        formik.values.inputAmount &&
        Number(formik.values.inputAmount) &&
        new Decimal(formik.values.inputAmount).gt(0)
      ) {
        const state = await checkAllowances(
          inputTokenAddress,
          formik.values.inputAmount
        );

        setApproval(state);
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
          initialValues={{
            amount: MaxUint256.toString(),
          }}
          onSubmit={async ({ amount }) => {
            console.log("hello");
            const _tokenA = new Token(
              SUPPORTED_CHAINS["1"],
              formik.values.input.address,
              formik.values.input.decimals,
              formik.values.input.symbol,
              formik.values.input.name
            );

            try {
              console.log("Approve token to be spent", _tokenA);
              const nonceManager = new NonceManager(_wallet!);
              const tokenApproval = await getTokenTransferApproval(
                _tokenA,
                amount,
                nonceManager, // signer
                _address!
              );
              
              console.log("SUCCESS", tokenApproval);
              
            } catch (error) {
              console.log("ERROR");
              console.error(error);
            }
          }}
        >
          {({ handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <ApproveFieldWrapper token={token} />

              <button
                type="submit"
                className="py-4 disabled:bg-gray-800 disabled:text-gray-600 hover:bg-opacity-90 bg-teal-300 text-black text-lg w-full font-bold my-2"
              >
                Approve
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
