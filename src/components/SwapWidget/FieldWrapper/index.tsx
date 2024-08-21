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
      }    rounded pb-0 flex justify-between ${
        f ? "" : ""
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
          className={`${f && "underline"} w-full max-w text-2xl truncate bg-transparent font-mono focus:border-none focus:outline-none placeholder:text-neutral-500 font-bold`}
        />
      </div>
      <div
        className={`grid my-auto ${
          reviewMode ? " flex items-center py-0" : ""
        }`}
      >
        <div className="font-bold">{type === 'input' && formik.values.input.symbol}{type === 'output' && formik.values.output.symbol}</div>
        <p className="font-mono tracking-widest text-center dark:text-neutral-500 text-xs">
          {balance &&
            balance.length ?
            new Decimal(formatUnits(balance!, decimals!).toString()).toFixed(0):'-'}
        </p>
        {type === "output" && <div className="my-1" />}
        
        {type === "input" && !reviewMode && !(balance && formik.values.inputAmount.length && new Decimal(formatUnits(balance, decimals)).equals(formik.values.inputAmount)) && (
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
