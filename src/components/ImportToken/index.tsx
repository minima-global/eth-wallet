import { useContext, useEffect, useState } from "react";
import { appContext } from "../../AppContext";
import { useSpring, animated, config } from "react-spring";
import { createPortal } from "react-dom";
import styles from "./ImportToken.module.css";
import Dialog from "../UI/Dialog";
import ERC20ABI from "../../abis/ERC20.json";
import { Contract, getAddress } from "ethers";
import { Formik } from "formik";
import * as yup from "yup";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";

const ImportToken = () => {
  const [step, setStep] = useState(0);
  const { _chainId } = useWalletContext();
  const { _promptTokenImport, promptTokenImport, _provider, updateDefaultAssets, _defaultAssets } =
    useContext(appContext);

  async function getTokenMetadata(address: string) {
    const tokenContract = new Contract(address, ERC20ABI, _provider);

    const symbol = await tokenContract.symbol();
    const name = await tokenContract.name();
    const decimals = await tokenContract.decimals();

    return { symbol, decimals, name };
  }

  const springProps = useSpring({
    opacity: _promptTokenImport ? 1 : 0,
    transform: _promptTokenImport
      ? "translateY(0%) scale(1)"
      : "translateY(-50%) scale(0.8)",
    config: config.wobbly,
  });

  return (
    <>
      <div className="flex justify-center my-4">
        <button
          className="bg-violet-300 text-black dark:text-white bg-opacity-10 rounded flex items-center gap-2 font-bold text-lighter hover:bg-opacity-30"
          onClick={promptTokenImport}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 5l0 14" />
            <path d="M5 12l14 0" />
          </svg>
          Import tokens
        </button>
      </div>

      {_promptTokenImport &&
        createPortal(
          <Dialog dismiss={promptTokenImport}>
            <div className="h-[100vh_-_64px] grid items-center mt-[80px]">
              <animated.div className={styles["tokens"]} style={springProps}>
                <div className=" bg-white shadow-lg shadow-slate-300 dark:shadow-sm dark:bg-black w-[calc(100%_-_16px)] md:w-full p-4 px-0 rounded mx-auto">
                  <div className="px-4 flex justify-between gap-2 items-center">
                    <div>
                    <h3 className="font-bold">Import tokens</h3>                    
                    </div>
                    <svg
                      onClick={promptTokenImport}
                      xmlns="http://www.w3.org/2000/svg"
                      className="icon icon-tabler icon-tabler-x"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      strokeWidth="4.5"
                      stroke="currentColor"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M18 6l-12 12" />
                      <path d="M6 6l12 12" />
                    </svg>
                  </div>
                  <Formik
                    initialValues={{
                      address: "",
                      decimals: 18,
                      symbol: "",
                      name: "",
                    }}
                    onSubmit={async ({ address, decimals, symbol, name, }, {resetForm}) => {
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
                            await c.deployed();
                            return true;  
                          } catch (error) {
                            return createError({
                              path,
                              message: "Invalid ERC20 Contract",
                            });
                          }
                        })                    
                        .test("checking if already has this token", function (val) {
                          const { path, createError } = this;

                          try {
                            const alreadyHasToken = _defaultAssets.assets.find(a => a.address === val);
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
                      symbol: yup.string().required(),
                      decimals: yup.number().required(),
                    })}
                  >
                    {({
                      isValid,
                      values,
                      errors,
                      dirty,
                      handleSubmit,
                      getFieldProps,
                      handleBlur,
                      handleChange,
                      setFieldValue,
                    }) => (
                      <form className="my-4 px-4" onSubmit={handleSubmit}>
                        {step === 0 && (
                          <>
                            <label>
                              <span className="px-4">
                                Token contract address
                              </span>
                              <input
                                type="text"
                                id="address"
                                name="address"
                                onChange={async (e) => {
                                  handleChange(e);
                                  try {
                                    const { symbol, decimals, name } =
                                      await getTokenMetadata(e.target.value);
                                    // set fields
                                    setFieldValue(
                                      "decimals",
                                      parseInt(decimals)
                                    );
                                    setFieldValue("symbol", symbol);
                                    setFieldValue("name", name);
                                  } catch (error) {
                                    // reset fields
                                    setFieldValue("decimals", 0);
                                    setFieldValue("symbol", "");
                                  }
                                }}
                                value={values.address}
                                onBlur={handleBlur}
                                placeholder="Token contract address"
                                className={`mb-2 ${
                                  errors.address
                                    ? "!border-4 !border-red-500"
                                    : ""
                                }`}
                              />
                            </label>

                            {errors.address && (
                              <div className="my-2 bg-red-500 text-white rounded px-4 py-1">
                                {errors.address}
                              </div>
                            )}

                            {(values.decimals > 0 ||
                              values.symbol.length > 0) && (
                              <>
                                <label>
                                  <span className="px-4">Token symbol</span>
                                  <input
                                    type="text"
                                    {...getFieldProps("symbol")}
                                    onBlur={handleBlur}
                                    placeholder="Token symbol"
                                    className={`mb-2 ${
                                      errors.symbol
                                        ? "!border-4 !border-red-500"
                                        : ""
                                    }`}
                                  />
                                </label>
                                <label>
                                  <span className="px-4">Token decimals</span>

                                  <input
                                    disabled
                                    type="number"
                                    {...getFieldProps("decimals")}
                                    onBlur={handleBlur}
                                    placeholder="Token decimals"
                                    className={`mb-2 ${
                                      errors.decimals
                                        ? "!border-4 !border-red-500"
                                        : ""
                                    }`}
                                  />
                                </label>
                              </>
                            )}

                            <button
                              disabled={!dirty || !isValid}
                              type="button"
                              onClick={() => setStep(1)}
                              className="w-full mt-4 bg-teal-500 bg-opacity-90 text-black disabled:bg-opacity-10 disabled:text-slate-500 font-bold"
                            >
                              Next
                            </button>
                          </>
                        )}

                        {step === 1 && (
                          <>
                            <h3 className="text-left mb-4">
                              Would you like to import this token?
                            </h3>

                            <DisplayToken
                              name={values.name}
                              address={values.address}
                              symbol={values.symbol}
                              decimals={values.decimals}
                            />

                            <div className="grid grid-cols-2 gap-2 mt-4">
                              <button
                                onClick={() =>
                                  setStep((prevState) => prevState - 1)
                                }
                                className="rounded-lg text-black dark:text-white border-teal-300 hover:text-black font-bold hover:bg-teal-300"
                              >
                                Back
                              </button>
                              <button disabled={!isValid} type="submit" className="w-full hover:bg-teal-500 bg-teal-300 text-black font-bold">
                                Import
                              </button>
                            </div>
                          </>
                        )}
                      </form>
                    )}
                  </Formik>
                </div>
              </animated.div>
            </div>
          </Dialog>,
          document.body
        )}
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
      <div className="rounded bg-white bg-opacity-10 px-4 py-1 gap-2 flex">
        <div className="my-auto w-[36px] h-[36px] bg-white rounded-full overflow-hidden flex justify-center items-center shadow-md text-black font-bold">
          {name.substring(0, 1).toUpperCase()}
        </div>

        <div className="flex flex-col">
          <h3 className="font-bold">{name}</h3>
          <p className="font-mono text-sm">
            {ownerBalance} {symbol}
          </p>
        </div>
      </div>
    </>
  );
};
