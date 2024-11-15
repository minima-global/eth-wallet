import { useContext, useEffect, useState } from "react";
import { appContext } from "../../AppContext";
import ERC20ABI from "../../abis/ERC20.json";
import { Contract, getAddress } from "ethers";
import { Formik } from "formik";
import * as yup from "yup";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";
import { rings } from "@dicebear/collection";
import { createAvatar } from "@dicebear/core";
import AnimatedDialog from "../UI/AnimatedDialog";
import Cross from "../UI/Cross";

const ImportToken = () => {
  const [step, setStep] = useState(0);
  const { _chainId } = useWalletContext();
  const {
    _promptTokenImport,
    promptTokenImport,
    _provider,
    updateDefaultAssets,
    _defaultAssets,
  } = useContext(appContext);

  async function getTokenMetadata(address: string) {
    const tokenContract = new Contract(address, ERC20ABI, _provider);

    const symbol = await tokenContract.symbol();
    const name = await tokenContract.name();
    const decimals = await tokenContract.decimals();

    return { symbol, decimals, name };
  }

  return (
    <>
      <div className="flex justify-center my-4">
        <button
          onClick={promptTokenImport}
          type="button"
          className="max-w-sm text-xs text-neutral-500 bg-neutral-100 dark:bg-[#1B1B1B] full-rounded border border-neutral-200 hover:border-neutral-500 dark:border-neutral-600 dark:hover:border-neutral-500 bg-transparent dark:text-neutral-100 font-bold focus:outline-none"
        >
          Import tokens
        </button>
      </div>

      <AnimatedDialog
        display={_promptTokenImport}
        dismiss={() => promptTokenImport()}
      >
        <div className="p-4 px-0 rounded">
          <div className="px-4 flex justify-between gap-2 items-center">
            <div>
              <h3 className="font-bold">Import tokens</h3>
            </div>
            <Cross dismiss={promptTokenImport} />
          </div>
          <Formik
            initialValues={{
              address: "",
              decimals: 18,
              symbol: "",
              name: "",
            }}
            validateOnChange={true}
            onSubmit={async (
              { address, decimals, symbol, name },
              { resetForm }
            ) => {
              try {
                const newToken = {
                  name,
                  symbol,
                  balance: "",
                  address,
                  decimals,
                  type: "erc20",
                };

                await updateDefaultAssets(newToken, _chainId!);
                setStep(0);
                resetForm();
                promptTokenImport();
              } catch (error) {
                //
                console.error(error);
              }
            }}
            validationSchema={yup.object().shape({
              address: yup
                .string()
                .required("Enter a contract address")
                .test("testing address checksum", async function (val) {
                  const { path, createError } = this;

                  if (!val || val.length === 0) return false;

                  try {
                    getAddress(val);
                    const c = new Contract(val, ERC20ABI, _provider);

                    await c.name();
                    return true;
                  } catch (error) {
                    return createError({
                      path,
                      message: "Invalid ERC-20 Contract",
                    });
                  }
                })
                .test("checking if already has this token", function (val) {
                  const { path, createError } = this;

                  try {
                    const alreadyHasToken = _defaultAssets.assets.find(
                      (a) => a.address === val
                    );
                    if (alreadyHasToken) {
                      return createError({
                        path,
                        message: "You have already imported this token.",
                      });
                    }
                    return true;
                  } catch (error) {
                    return createError({
                      path,
                      message: "Invalid ERC20 Contract",
                    });
                  }
                }),
              symbol: yup.string(),
              decimals: yup.number(),
            })}
          >
            {({
              isValid,
              values,
              errors,
              dirty,
              handleSubmit,
              getFieldProps,
              handleChange,
              setFieldValue,
            }) => (
              <form className="" onSubmit={handleSubmit}>
                {step === 0 && (
                  <>
                    <div className="space-y-4 pt-4">
                      <div className="flex flex-col px-4">
                        <label
                          htmlFor="nickname"
                          className="px-4 text-sm pb-1 dark:text-neutral-500"
                        >
                          Token Contract Address
                        </label>
                        <input
                          type="text"
                          id="address"
                          {...getFieldProps("address")}
                          onChange={async (e) => {
                            handleChange(e);
                            try {
                              const { symbol, decimals, name } =
                                await getTokenMetadata(e.target.value);
                              // set fields
                              setFieldValue("decimals", parseInt(decimals));
                              setFieldValue("symbol", symbol);
                              setFieldValue("name", name);
                            } catch (error) {
                              // reset fields
                              setFieldValue("decimals", 0);
                              setFieldValue("symbol", "");
                            }
                          }}
                          placeholder="Contract Address"
                          className="w-full p-4 rounded text-white dark:text-neutral-100 dark:placeholder:text-neutral-600 focus:outline-neutral-500 dark:focus:outline-neutral-800 disabled:opacity-50"
                        />
                      </div>
                      {errors.address && (
                        <div className="px-6">
                          <p className="text-red-400 pt-1">
                            {errors.address}
                          </p>
                        </div>
                      )}
                      <div className="flex flex-col px-4">
                        <label
                          htmlFor="decimals"
                          className="px-4 text-sm pb-1 dark:text-neutral-500"
                        >
                          Decimals
                        </label>
                        <input
                          disabled
                          type="number"
                          id="decimals"
                          {...getFieldProps("decimals")}
                          placeholder="Token Decimals"
                          className="w-full p-4 rounded text-white dark:text-neutral-100 dark:placeholder:text-neutral-600 focus:outline-neutral-500 dark:focus:outline-neutral-800 disabled:opacity-50"
                        />
                      </div>
                    </div>
                    

                    {(values.decimals > 0 || values.symbol.length > 0) && (
                      <>
                        <div className="space-y-4 pt-4">
                          <div className="flex flex-col px-4">
                            <label
                              htmlFor="nickname"
                              className="px-4 text-sm pb-1 dark:text-neutral-500"
                            >
                              Token Symbol
                            </label>
                            <input
                              type="text"
                              id="symbol"
                              {...getFieldProps("symbol")}
                              placeholder="Token Symbol"
                              className="w-full p-4 rounded text-white dark:text-neutral-100 dark:placeholder:text-neutral-600 focus:outline-neutral-500 dark:focus:outline-neutral-800 disabled:opacity-50"
                            />
                          </div>
                          <div className="flex flex-col px-4">
                            <label
                              htmlFor="privatekey"
                              className="px-4 text-sm pb-1 dark:text-neutral-500"
                            >
                              Private Key
                            </label>
                            <input
                              disabled
                              type="number"
                              id="decimals"
                              {...getFieldProps("decimals")}
                              placeholder="Token Decimals"
                              className="w-full p-4 rounded text-white dark:text-neutral-100 dark:placeholder:text-neutral-600 focus:outline-neutral-500 dark:focus:outline-neutral-800 disabled:opacity-50"
                            />
                          </div>
                        </div>
                        
                      </>
                    )}

                    <div className="mx-4 mt-8">
                      <button
                        disabled={!dirty || !isValid}
                        type="button"
                        onClick={() => setStep(1)}
                        className="w-full full-rounded border border-neutral-400 hover:border-neutral-500 bg-transparent dark:text-neutral-100 dark:border-neutral-500 hover:dark:border-neutral-400 font-bold disabled:opacity-30"
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}

                {step === 1 && (
                  <>
                    <h3 className="text-left mb-4 px-4 mt-4 text-sm">
                      Would you like to import this token?
                    </h3>

                    <DisplayToken
                      name={values.name}
                      address={values.address}
                      symbol={values.symbol}
                      decimals={values.decimals}
                    />

                    <div className="grid grid-cols-2 gap-2 mt-4 mx-4">
                      <button
                        onClick={() => setStep((prevState) => prevState - 1)}
                        className="w-full full-rounded border border-neutral-400 hover:border-neutral-500 bg-transparent dark:text-neutral-100 dark:border-neutral-500 hover:dark:border-neutral-400 font-bold disabled:opacity-30"
                      >
                        Back
                      </button>
                      <button
                        disabled={!isValid}
                        type="submit"
                        className="bg-violet-500 text-white font-bold tracking-wide dark:bg-violet-500 hover:dark:bg-violet-600 dark:text-black disabled:bg-opacity-50 dark:disabled:bg-opacity-50"
                      >
                        Import
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}
          </Formik>
        </div>
      </AnimatedDialog>
    </>
  );
};

export default ImportToken;

interface IProps {
  symbol: string;
  address: string;
  name: string;
  decimals: number;
}
const DisplayToken = ({ name, address, symbol }: IProps) => {
  const { _provider } = useContext(appContext);
  const [ownerBalance, setOwnerBalance] = useState(0);
  const { _wallet } = useWalletContext();

  useEffect(() => {
    async () => {
      const contract = new Contract(address, ERC20ABI, _provider);
      const walletAddress = await _wallet?.getAddress();
      const balance = await contract.balanceOf(walletAddress);
      setOwnerBalance(balance);
    };
  }, [_provider, _wallet, address]);

  return (
    <>
      <div className="rounded bg-neutral-100 dark:bg-[#1B1B1B] px-4 py-2 gap-2 flex mx-4">
        <div className="my-auto w-[44px] h-[44px] bg-white rounded-full overflow-hidden flex justify-center items-center shadow-md text-black font-bold">
          <Bear extraClass="w-[44px]" input={address} />
        </div>

        <div className="flex flex-col ml-2 mt-1">
          <h3 className="font-bold">{name}</h3>
          <p className="font-mono text-sm">
            {ownerBalance} {symbol}
          </p>
        </div>
      </div>
    </>
  );
};

interface BearProps {
  input: string;
  extraClass?: string;
}
const Bear = ({ input, extraClass }: BearProps) => {
  const avatar = createAvatar(rings, {
    seed: input,
    // ... other options
  });

  const svg = avatar.toDataUriSync();

  return (
    <div className="rounded-full bg-teal-300">
      <img className={`${extraClass && extraClass}`} src={svg} />
    </div>
  );
};
