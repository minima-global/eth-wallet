import { Formik } from "formik";
import { useContext, useState } from "react";
import { appContext } from "../../../AppContext";
import { MaxUint256 } from "ethers";
import { Token } from "@uniswap/sdk-core";
import { useWalletContext } from "../../../providers/WalletProvider/WalletProvider";
import { _defaults } from "../../../constants";
import { getTokenTransferApproval } from "../libs/getTokenTransferApproval";

const Allowance = () => {
  const {
    _network: currentNetwork,
    _wallet: signer,
    _address,
  } = useWalletContext();
  const { _promptAllowance, setPromptAllowance, _approving, setApproving } =
    useContext(appContext);

  const [error, setError] = useState<string | false>(false);
  const [step, setStep] = useState(1);

  // this should check on load our allowances for both USDT & wMinima on the HTLC contract
  // useAllowanceChecker();

  if (!_promptAllowance) {
    return null;
  }

  const isDefault = !_approving && !error && step === 1;
  const isApproved = !_approving && !error && step === 2;
  const isError = !_approving && error;
  const isApproving = _approving && !error;

  return (
    <div className="absolute left-0 right-0 bottom-0 top-0 flex justify-center z-[1000]">
      <div
        onClick={() => (!isApproving ? setPromptAllowance(false) : null)}
        className="backdrop-blur-sm z-9 fixed left-0 right-0 top-0 bottom-0"
      ></div>
      <div className="z-9 fixed h-[400px] max-w-sm mx-4 md:mx-auto bg-white dark:bg-black rounded-lg !shadow-teal-800 !shadow-sm overflow-hidden w-full">
        <div className="flex justify-between py-3 items-center px-4">
          {isDefault && (
            <h3 className="my-auto font-bold">Allowance Approval</h3>
          )}
          {isApproved && (
            <h3 className="my-auto font-bold">Allowance Approved</h3>
          )}
          {isError && <h3 className="my-auto font-bold">Approval Failed</h3>}
          {isApproving && (
            <h3 className="my-auto font-bold">Approving Allowance</h3>
          )}
        </div>

        <div className="flex flex-col h-[calc(100%_-_60px)] justify-between">
          <div>
            {isDefault && (
              <p className="px-4 text-sm">
                You need to approve your wMinima & USDT to start swapping. You
                will need some ETH for this approval.
              </p>
            )}
            {isApproved && (
              <p className="px-4 text-sm">Approved Allowances, ready to go!</p>
            )}
            {isError && <p className="px-4 text-sm">{error}</p>}

            {_approving && (
              <p className="px-4 text-sm animate-pulse text-black dark:text-white">
                Approving... Please be patient and do not refresh this page.
              </p>
            )}
          </div>

          <Formik
            initialValues={{}}
            onSubmit={async () => {
              setApproving(true);
              setError(false);

              try {
                const supportedChains =
                  currentNetwork === "mainnet" ? 1 : 11155111;
                const wMinimaAddress = _defaults["wMinima"][currentNetwork];
                const tetherAddress = _defaults["Tether"][currentNetwork];

                const wMinima = new Token(
                  supportedChains,
                  wMinimaAddress,
                  18,
                  "WMINIMA",
                  "wMinima"
                );
                const tether = new Token(
                  11155111,
                  tetherAddress,
                  currentNetwork === "mainnet" ? 6 : 18,
                  "USDT",
                  "Tether"
                );

                await getTokenTransferApproval(
                  wMinima,
                  MaxUint256.toString(),
                  signer!,
                  _address!
                );

                await getTokenTransferApproval(
                  tether,
                  MaxUint256.toString(),
                  signer!,
                  _address!
                );

                setStep(2);
              } catch (error) {
                setStep(1);
                if (error instanceof Error) {
                  return setError(
                    error.message.includes("insufficient funds")
                      ? "Insufficient ETH, deposit some more ETH on the balance page and re-try"
                      : error.message
                  );
                }

                setError("Allowance approval failed");
              } finally {
                setApproving(false);
              }
            }}
          >
            {({ handleSubmit }) => (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col h-[calc(100%_-_100px)]"
              >
                <div className="flex-grow" />
                <div className="mx-3">
                  {step === 1 && (
                    <button
                      type="submit"
                      disabled={_approving}
                      className="disabled:bg-gray-500 hover:bg-opacity-80 w-full bg-teal-300 text-white  dark:text-black font-bold"
                    >
                      {_approving && "Approving..."}
                      {isDefault && "Approve"}
                      {isError && "Re-try"}
                    </button>
                  )}
                  {step === 2 && (
                    <button
                      type="button"
                      onClick={() => setPromptAllowance(false)}
                      className="disabled:bg-gray-500 hover:bg-opacity-80 w-full bg-teal-300 text-white  dark:text-black font-bold"
                    >
                      Ready to swap
                    </button>
                  )}
                </div>
              </form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default Allowance;
