import { Formik } from "formik";
import { useContext, useState } from "react";
import { appContext } from "../../../AppContext";
import { MaxUint256 } from "ethers";
import { Token } from "@uniswap/sdk-core";
import { useWalletContext } from "../../../providers/WalletProvider/WalletProvider";
import { _defaults } from "../../../constants";
import { getTokenTransferApproval } from "../libs/getTokenTransferApproval";
import AnimatedDialog from "../../UI/AnimatedDialog";
import Cross from "../../UI/Cross";

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

  const isDefault = !_approving && !error && step === 1;
  const isApproved = !_approving && !error && step === 2;
  const isError = !_approving && error;
  const isApproving = _approving && !error;

  return (
    <AnimatedDialog
      up={60}
      display={_promptAllowance}
      dismiss={() => (!isApproving ? setPromptAllowance(false) : null)}
    >
      <div>
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

          {!isApproving && <Cross dismiss={() => setPromptAllowance(false)} />}
        </div>

        <div className="flex flex-col h-[calc(100%_-_60px)] justify-between">
          <div>
            {isDefault && (
              <div>
                <p className="px-4 text-sm">
                  You need to approve your wMinima & USDT to start swapping. 
                </p>
                <p className="px-4 text-xs font-bold">
                  You require some ETH for this.
                </p>

              </div>
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
                <div className="mx-3 mt-36">
                  {step === 1 && (
                    <button
                      type="submit"
                      disabled={_approving}
                      className="w-full full-rounded border border-neutral-500 hover:border-neutral-600 bg-transparent dark:text-neutral-100 dark:border-neutral-500 hover:dark:border-neutral-400 font-bold disabled:opacity-30"
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
                      I'm Ready
                    </button>
                  )}
                </div>
              </form>
            )}
          </Formik>
        </div>
      </div>
    </AnimatedDialog>
  );
};

export default Allowance;
