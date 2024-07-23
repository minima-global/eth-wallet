import Decimal from "decimal.js";
import { formatUnits } from "ethers";
import { FormikContextType, FormikValues, useFormikContext } from "formik";
import { useState } from "react";

interface Props {
  type: "input" | "output";
  token: JSX.Element;
  disabled: boolean;
  handleBlur: any;
  balance?: string;
  decimals?: number;
  extraClass?: string;
  inputRef?: any;
  buttonRef?: any;
  reviewMode?: boolean;
}
const FieldWrapper = ({
  handleBlur,
  reviewMode,
  disabled,
  extraClass,
  type,
  token,
  balance,
  decimals,
  inputRef,
  buttonRef,
}: Props) => {
  const [f, setF] = useState(false);
  const formik: FormikContextType<FormikValues> = useFormikContext();

  return (
    <div
      className={`${disabled ? "opacity-30" : ""} ${
        extraClass && extraClass
      }   bg-gray-100 dark:bg-gray-800 rounded pb-0 grid grid-cols-[1fr_auto] ${
        f ? "border border-teal-300" : ""
      } overflow-hidden`}
    >
      <div className="p-4">
        <label className="block text-sm text-gray-500 font-bold">
          {type === "input" ? "You pay" : "You receive"}
        </label>
        <input
          readOnly={type !== "input"}
          disabled={disabled || reviewMode}
          ref={inputRef}
          {...formik.getFieldProps(
            type === "input" ? "inputAmount" : "outputAmount"
          )}
          onBlur={(e) => {
            handleBlur(e);
            setF(false);
          }}
          onFocus={() => setF(true)}
          placeholder="0"
          className="w-full max-w text-2xl truncate bg-gray-100 dark:bg-gray-800 font-mono focus:border-none focus:outline-none placeholder:text-teal-300 font-bold"
        />
      </div>
      <div
        className={`bg-gray-400 dark:bg-gray-700 bg-opacity-10 p-4 pb-0 grid grid-rows-[1fr_auto] ${
          reviewMode ? " flex items-center py-0" : ""
        }`}
      >
        <div>{token}</div>
        <p className="font-mono tracking-wider font-bold text-gray-500 text-center">
          {balance &&
            balance.length ?
            new Decimal(formatUnits(balance!, decimals!).toString()).toFixed(0):'-'}
        </p>
        {type === "output" && <div className="my-1" />}
        {type === "input" && !reviewMode && (
          <button
            ref={buttonRef}
            type="button"
            onClick={() =>
              formik.setFieldValue(
                "inputAmount",
                formatUnits(balance!, decimals!).toString()
              )
            }
            className="!outline-none p-0 m-0 tracking-wide transition-all hover:text-black dark:text-neutral-400 dark:hover:text-teal-500 font-bold"
          >
            MAX
          </button>          
        )}
      </div>
    </div>
  );
};

export default FieldWrapper;
