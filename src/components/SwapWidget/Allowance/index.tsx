import { Formik } from "formik";
import { useContext, useEffect, useState } from "react";
import { appContext } from "../../../AppContext";
import { MaxUint256 } from "ethers";
import { Token } from "@uniswap/sdk-core";
import { useWalletContext } from "../../../providers/WalletProvider/WalletProvider";
import { _defaults } from "../../../constants";
import {
  approveTokenWithLedger,
  getTokenTransferApproval,
} from "../libs/getTokenTransferApproval";
import AnimatedDialog from "../../UI/AnimatedDialog";
import Cross from "../../UI/Cross";
import { SWAP_ROUTER_ADDRESS } from "../../../providers/QuoteProvider/libs/constants";
import RefreshIcon from "../../UI/Icons/RefreshIcon";
import { useGasContext } from "../../../providers/GasProvider";

const Allowance = () => {
  const {
    _network: currentNetwork,
    _wallet: signer,
    _address,
  } = useWalletContext();
  const { gasInfo, startFetchingGasInfo, stopFetchingGasInfo } = useGasContext();
  
  useEffect(() => {
    startFetchingGasInfo();    
    
    return () => {
      stopFetchingGasInfo();
    }
  }, [stopFetchingGasInfo, startFetchingGasInfo]);
  
  const {
    _provider,
    _userAccounts,
    _promptAllowance,
    _allowanceLock,
    setPromptAllowance,
    _approving,
    setApproving,
  } = useContext(appContext);


  useEffect(() => {
    // simulateLedgerApproval(); // Start the approval process when the component mounts
  }, []);

  const [ledgerContext, setLedgerContext] = useState<
    | false
    | {
        status: "waiting" | "success";
        approving: { wminima: boolean; tether: boolean };
      }
  >(false);
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
            {isError && <p className="px-4 text-sm break-all">{error}</p>}

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
              const current = _userAccounts.find((a) => a.current);

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

                if (current.type === "ledger") {
                  
                  if (!gasInfo) throw new Error("No Gas Info Available, please refresh this page");
                  // Estimate Gas for approval 

                  const { suggestedMaxFeePerGas, suggestedMaxPriorityFeePerGas } = gasInfo!;


                  setLedgerContext({status: 'waiting', approving: {..._allowanceLock}});

                  if (_allowanceLock.wminima) {
                    // approve Minima
                    await approveTokenWithLedger({
                      current,
                      tokenAddress: wMinimaAddress,
                      spenderAddress: SWAP_ROUTER_ADDRESS,
                      amountToApprove: MaxUint256.toString(),
                      chainId: supportedChains,
                      gasLimit: undefined,
                      gasPrice: suggestedMaxFeePerGas,
                      priorityFee: suggestedMaxPriorityFeePerGas,
                      nonce: await _provider.getTransactionCount(current.address),
                      bip44Path: current.bip44Path,
                      provider: _provider,
                    });
                    
                    setLedgerContext({status: 'waiting', approving: {wminima: false, tether: true}});
                  }
                  

                  if (_allowanceLock.tether) {
                    // approve Minima
                    await approveTokenWithLedger({
                      current,
                      tokenAddress: tetherAddress,
                      spenderAddress: SWAP_ROUTER_ADDRESS,
                      amountToApprove: MaxUint256.toString(),
                      chainId: supportedChains,
                      gasLimit: undefined,
                      gasPrice: suggestedMaxFeePerGas,
                      priorityFee: suggestedMaxPriorityFeePerGas,
                      nonce: await _provider.getTransactionCount(current.address),
                      bip44Path: current.bip44Path,
                      provider: _provider,
                    });
                    
                    setLedgerContext({status: 'success', approving: {wminima: true, tether: true}});
                  }


                  setTimeout(() => {
                    setLedgerContext(false);
                  }, 3000);

                } else {
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
                }

                setStep(2);
              } catch (error) {
                setStep(1);
                setLedgerContext(false);

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
                className="relative flex flex-col h-[calc(100%_-_100px)]"
              >
                <div
                  className={`${
                    ledgerContext
                      ? "absolute left-0 right-0 bottom-0 top-0 flex items-center justify-center"
                      : "hidden"
                  }`}
                >
                  <div className="fixed backdrop-blur-sm left-0 right-0 top-0 bottom-0 z-[43] bg-neutral-200/50 dark:bg-black/50"></div>
                  <div className="z-[46] flex items-center justify-center flex-col text-sm gap-2">
                    {ledgerContext && ledgerContext.status === "waiting" && (
                      <>
                        <span className="animate-spin">
                          <RefreshIcon
                            fill="currentColor"
                          />
                        </span>
                        <span>
                          {ledgerContext.approving.wminima
                            ? "Waiting for Ledger confirmation for WMinima..."
                            : ledgerContext.approving.tether
                            ? "Waiting for Ledger confirmation for Tether..."
                            : ""}
                        </span>
                      </>
                    )}
                    {ledgerContext && ledgerContext?.status === "success" && (
                      <span>
                        Approval successful.
                      </span>
                    )}
                  </div>
                </div>
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
                      className="w-full full-rounded border border-neutral-500 hover:border-neutral-600 bg-transparent dark:text-neutral-100 dark:border-neutral-500 hover:dark:border-neutral-400 font-bold disabled:opacity-30"
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
