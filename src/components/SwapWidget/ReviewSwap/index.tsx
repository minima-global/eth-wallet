import { FormikContextType, FormikValues, useFormikContext } from "formik";
import AnimatedDialog from "../../UI/AnimatedDialog";
import Cross from "../../UI/Cross";
import FieldWrapper from "../FieldWrapper";
import getTokenWrapper from "../libs/getTokenWrapper";
import GasFeeEstimator from "../GasFeeEstimator";

const ReviewSwap = ({ step, setStep, submitForm, error }) => {
  const formik: FormikContextType<FormikValues> = useFormikContext();

  const { handleBlur, resetForm, errors } = formik;
  const { inputAmount, outputAmount, input, output, receipt } = formik.values;

  return (
    <AnimatedDialog
      extraClass="z-[25]"
      dialogStyles="!shadow-sm !shadow-gray-600"
      position=" items-start mt-[86px]"
      isOpen={step === 2 || step === 3 || step === 4 || step === 5}
      onClose={() => (step === 2 ? setStep(1) : null)}
      animationStyle="stiff"
    >
      {step === 2 && (
        <>
          <div className="px-4 grid grid-cols-[1fr_auto]">
            <div className="text-center">
              <h3 className="font-bold text-xl">Review Swap</h3>
            </div>
            <Cross dismiss={() => setStep(1)} />
          </div>

          <div className="px-8 my-4">
            <FieldWrapper
              handleBlur={handleBlur}
              extraClass="mb-1"
              disabled={false}
              reviewMode={true}
              type="input"
              balance={input?.balance}
              decimals={input?.decimals}
              token={<>{input ? getTokenWrapper(input) : null}</>}
            />
            <FieldWrapper
              handleBlur={handleBlur}
              disabled={false}
              reviewMode={true}
              type="output"
              balance={output?.balance}
              decimals={output?.decimals}
              token={<>{output ? getTokenWrapper(output) : null}</>}
            />

            <div className="border-b border-gray-800 my-4"></div>

            <GasFeeEstimator />

            {!errors.gas && (
              <button
                onClick={() => submitForm()}
                type="button"
                className="w-full tracking-wider font-bold p-4 bg-teal-500 dark:bg-teal-300 text-white mt-4 dark:text-black"
              >
                Confirm Swap
              </button>
            )}

            {errors.gas && (
              <button
                disabled={true}
                type="button"
                className="bg-opacity-50 w-full tracking-wider font-bold p-4 bg-teal-500 dark:bg-teal-300 text-white mt-4 dark:text-black"
              >
                {errors.gas ? errors.gas as string : "Error gas"}
              </button>
            )}
          </div>
        </>
      )}
      {step === 3 && (
        <>
          <div className="px-4 grid grid-cols-[1fr_auto_1fr]">
            <div />
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
          <h1 className="text-lg font-bold tracking-wider text-center animate-pulse">Swapping...</h1>
            <div className="grid grid-cols-[1fr_auto_1fr]">
              <div />

              <div className="flex items-center my-4">
                <div className="flex items-center justify-center">
                  {getTokenWrapper(input, inputAmount)}
                </div>
                <div className="px-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
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
                </div>
                <div className="flex items-center justify-center">
                  {getTokenWrapper(output, outputAmount)}
                </div>
              </div>
              <div />
            </div>
          </div>
        </>
      )}
      {step === 4 && (
        <>          
          <div className="px-8 my-4">
            <h1 className="text-lg font-bold tracking-wider text-center">Swap Successful</h1>

            <div className="grid grid-cols-[1fr_auto_1fr]">
              <div />

              <div className="flex items-center my-4">
                <div className="flex items-center justify-center">
                  {getTokenWrapper(input, inputAmount)}
                </div>
                <div className="px-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
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
                </div>
                <div className="flex items-center justify-center">
                  {getTokenWrapper(output, outputAmount)}
                </div>
              </div>
              <div />
            </div>

            <div className="border-b border-gray-800 my-4"></div>

            {receipt && receipt.hash && (
              <div className="text-center my-4">
                <a
                  href={`https://etherscan.io/tx/${receipt.hash}`}
                  target="_blank"
                  className="cursor-pointer text-violet-300 hover:!text-violet-400"
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
              className="p-4 w-full font-bold tracking-wider text-white bg-[#1B1B1B] dark:bg-opacity-10 hover:bg-opacity-90 dark:hover:bg-opacity-50"
            >
              Done
            </button>
          </div>
        </>
      )}
      {step === 5 && (
        <>
          <div className="px-8 my-4">
            <div>
            <h1 className="text-lg font-bold tracking-wider text-center">Something went wrong</h1>
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr]">
              <div />

              <div className="flex gap-2 items-center my-4 break-all">
                <p>{error && error.includes("insufficient") ? "Insufficient funds!" : error ? error : "Let's go back and try again..."}</p>
              </div>
              <div />
            </div>

            <div className="border-b border-gray-800 my-4"></div>

            {receipt && receipt.hash && (
              <div className="text-center my-4">
                <a
                  href={`https://etherscan.io/tx/${receipt.hash}`}
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
              className="p-4 w-full font-bold tracking-wider text-white bg-[#1B1B1B] dark:bg-opacity-10 hover:bg-opacity-90 dark:hover:bg-opacity-50"
            >
              Okay
            </button>
          </div>
        </>
      )}
    </AnimatedDialog>
  );
};

export default ReviewSwap;
