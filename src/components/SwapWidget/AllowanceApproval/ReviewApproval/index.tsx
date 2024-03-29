import { useFormikContext } from "formik";
import AnimatedDialog from "../../../UI/AnimatedDialog";
import Cross from "../../../UI/Cross";
import GasFeeEstimator from "../../GasFeeEstimator";
import { useContext } from "react";
import { appContext } from "../../../../AppContext";
import ApproveFieldWrapper from "../ApproveFieldWrapper";

const ReviewApproval = ({ token, step, setStep, submitForm, error }) => {
  const formik: any = useFormikContext();

  const { promptAllowanceApprovalModal } = useContext(appContext);

  const { resetForm } = formik;
  const {receipt } = formik.values;

  return (
    <AnimatedDialog
      extraClass="z-[28]"
      dialogStyles="!shadow-sm !shadow-gray-600"
      position=" items-center"
      isOpen={step === 2 || step === 3 || step === 4 || step === 5}
      onClose={() => (step === 2 ? setStep(1) : null)}
      animationStyle="stiff"
    >
      {step === 2 && (
        <>
          <div className="px-4 grid grid-cols-[1fr_auto]">
            <div className="text-center">
              <h3 className="font-bold text-xl">Review Approval</h3>
            </div>
            <Cross dismiss={promptAllowanceApprovalModal} />
          </div>

          <div className="px-8 my-4">
            <ApproveFieldWrapper reviewMode={true} token={token} />

            <div className="border-b border-gray-800 my-4"></div>

            <GasFeeEstimator />

            <button
              onClick={() => submitForm()}
              type="button"
              className="py-4 disabled:bg-gray-800 disabled:text-gray-600 hover:bg-opacity-90 bg-teal-300 text-black text-lg w-full font-bold my-2"
            >
              Approve
            </button>
          </div>
        </>
      )}
      {step === 3 && (
        <>
          <div className="px-4 grid grid-cols-[1fr_auto]">
            <div className="flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="animate-spin"
                width="60"
                height="60"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M10 20.777a8.942 8.942 0 0 1 -2.48 -.969" />
                <path d="M14 3.223a9.003 9.003 0 0 1 0 17.554" />
                <path d="M4.579 17.093a8.961 8.961 0 0 1 -1.227 -2.592" />
                <path d="M3.124 10.5c.16 -.95 .468 -1.85 .9 -2.675l.169 -.305" />
                <path d="M6.907 4.579a8.954 8.954 0 0 1 3.093 -1.356" />
                <path d="M12 9l-2 3h4l-2 3" />
              </svg>
            </div>
            <div />
          </div>

          <div className="px-8 my-4">
            <p className="text-center animate-pulse font-bold text-violet-300">
              Approving...
            </p>            
          </div>
        </>
      )}
      {step === 4 && (
        <>
          <div className="px-4 grid grid-cols-[1fr_auto]">
            <div className="flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className=""
                width="60"
                height="60"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="#5eead4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M20.925 13.163a8.998 8.998 0 0 0 -8.925 -10.163a9 9 0 0 0 0 18" />
                <path d="M9 10h.01" />
                <path d="M15 10h.01" />
                <path d="M9.5 15c.658 .64 1.56 1 2.5 1s1.842 -.36 2.5 -1" />
                <path d="M15 19l2 2l4 -4" />
              </svg>
            </div>
            <div />
          </div>

          <div className="px-8 my-4">
            <p className="text-center font-bold text-teal-300">
              Approval Successful
            </p>            

            <div className="border-b border-gray-800 my-4"></div>

            {receipt && receipt.hash && (
              <div className="text-center my-4">
                <a
                  href={`https://etherscan.io/address/${receipt.hash}`}
                  target="_blank"
                  className="text-purple-400 cursor-pointer"
                >
                  View on etherscan
                </a>
              </div>
            )}
            <button
              onClick={() => {
                resetForm();
                setStep(1);
                promptAllowanceApprovalModal();
              }}
              type="button"
              className="py-4 disabled:bg-gray-800 disabled:text-gray-600 hover:bg-opacity-90 bg-blue-100 text-black text-lg w-full font-bold my-2"
            >
              Done
            </button>
          </div>
        </>
      )}
      {step === 5 && (
        <>
          <div className="px-4 grid grid-cols-[1fr_auto]">
            <div className="flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className=""
                width="60"
                height="60"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="#ef4444"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
                <path d="M9 13h.01" />
                <path d="M15 13h.01" />
                <path d="M11 17h2" />
              </svg>
            </div>
            <div />
          </div>

          <div className="px-8 my-4">
            <div>
              <p className="text-center font-bold text-red-500">
                Something went wrong
              </p>
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr]">
              <div />

              <div className="flex gap-2 items-center my-4">
                <p className="break-all">{error ? error : "Let's go back and try again."}</p>
              </div>
              <div />
            </div>

            <div className="border-b border-gray-800 my-4"></div>

            {receipt && receipt.hash && (
              <div className="text-center my-4">
                <a
                  href={`https://etherscan.io/address/${receipt.hash}`}
                  target="_blank"
                  className="text-purple-400 cursor-pointer"
                >
                  View on etherscan
                </a>
              </div>
            )}
            <button
              onClick={() => {
                resetForm();
                setStep(1);
              }}
              type="button"
              className="py-4 disabled:bg-gray-800 disabled:text-gray-600 hover:bg-opacity-90 bg-red-500 text-white text-lg w-full font-bold my-2"
            >
              Okay
            </button>
          </div>
        </>
      )}
    </AnimatedDialog>
  );
};

export default ReviewApproval;
