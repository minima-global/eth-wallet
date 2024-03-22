import { useState } from "react";
import { useQuoteProvider } from "../../providers/QuoteProvider/QuoteProvider";
import { Formik } from "formik";
import FieldWrapper from "./FieldWrapper";
import SwapDirection from "./SwapDirection";
import { useTokenStoreContext } from "../../providers/TokenStoreProvider";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";
import defaultAssetsStored, { _defaults } from "../../constants";
import { Asset } from "../../types/Asset";

const SwapWidget = () => {
  const { _network } = useWalletContext();
  const { tokens } = useTokenStoreContext();
  const [loading, setLoading] = useState(false);
  const { outputAmount } = useQuoteProvider();

  console.log(tokens);

  if (_network !== "mainnet") {
    return <p>This feature is only available on mainnet.</p>;
  }

  console.log({
    input: tokens.find((t) => t.address === _defaults["wMinima"].mainnet),
    output: tokens.find((t) => t.address === _defaults["Tether"].mainnet),
  });

  return (
    <div>
      <Formik
        initialValues={{
          input: tokens.find((t) => t.address === _defaults["wMinima"].mainnet),
          output: tokens.find((t) => t.address === _defaults["Tether"].mainnet),
        }}
        onSubmit={async ({ input, output }) => {
          setLoading(true);
        }}
      >
        {({
          handleSubmit,
          // setFieldValue,
          // isSubmitting,
          // getFieldProps,
          // handleChange,
          // handleBlur,
          // touched,
          // errors,
          values,
          // isValid,
          // dirty,
          // resetForm
        }) => (
          <form onSubmit={handleSubmit} className="relative">
            <FieldWrapper
              type="input"
              balance={values.input?.balance}
              token={<>{values.input ? getTokenWrapper(values.input) : null}</>}
            />
            <SwapDirection />
            <FieldWrapper
              extraClass="mt-1"
              type="output"
              balance={values.output?.balance}
              token={
                <>{values.output ? getTokenWrapper(values.output) : null}</>
              }
            />
            <button  className="py-4 disabled:bg-gray-800 disabled:text-gray-600 hover:bg-opacity-90 bg-teal-300 text-black text-lg w-full font-bold my-2">Swap</button>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default SwapWidget;

const getTokenWrapper = (asset: Asset) => {
  if (!asset) return null;

  const { address } = asset;

  const isWMINIMA = address === _defaults["wMinima"].mainnet;
  const isUSDT = address === _defaults["Tether"].mainnet;

  let tokenIconSrc = "";
  let tokenName = "";

  if (isWMINIMA) {
    tokenIconSrc = "./assets/token.svg";
    tokenName = "WMINIMA";
  } else if (isUSDT) {
    tokenIconSrc = "./assets/tether.svg";
    tokenName = "USDT";
  }
  console.log(tokenIconSrc);
  return (
    <div className="text-center flex items-center gap-1 p-1 rounded">
      {tokenIconSrc && (
        <img
          alt="token-icon"
          src={tokenIconSrc}
          className="w-[24px] h-[24px] rounded-full"
        />
      )}

      {tokenName && <p className="font-bold">{tokenName}</p>}
    </div>
  );
};
