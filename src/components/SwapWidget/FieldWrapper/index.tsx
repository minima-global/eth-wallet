import { formatUnits } from "ethers";
import { useFormikContext } from "formik";
import { useState } from "react";

interface Props {
  type: "input" | "output";
  token: JSX.Element;
  disabled: boolean;
  balance?: string;
  decimals?: number;
  extraClass?: string;
  inputRef?: any;
  buttonRef?: any;
  reviewMode?: boolean;
}
const FieldWrapper = ({
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
  const formik: any = useFormikContext();

  return (
    <div
      className={`${disabled ? "opacity-30" : ""} ${
        extraClass && extraClass
      }  bg-gray-800 rounded pb-0 grid grid-cols-[1fr_minmax(0,_142.16px)] ${
        f ? "border border-teal-300" : ""
      }`}
    >
      <div className="p-4">
        <label className="block text-sm text-gray-500 font-bold">
          {type === "input" ? "You pay" : "You receive"}
        </label>
        <input
          disabled={disabled || reviewMode}
          ref={inputRef}
          {...formik.getFieldProps(
            type === "input" ? "inputAmount" : "outputAmount"
          )}
          onBlur={() => setF(false)}
          onFocus={() => setF(true)}
          placeholder="0"
          className="text-2xl truncate bg-gray-800 font-mono focus:border-none focus:outline-none placeholder:text-teal-300 font-bold"
        />
      </div>
      <div className={`bg-gray-700 bg-opacity-10 p-4 pb-0 grid grid-rows-[1fr_auto] ${reviewMode ? " flex items-center py-0" : ""}`}>
        <div>{token}</div>
        <div className="grid grid-cols-[1fr_auto] items-center">
          {!reviewMode && (
            <>
              <p className="text-sm font-bold text-gray-500 pb-4">
                Balance:{" "}
                <span className="font-mono text-sm">
                  {formatUnits(balance!, decimals!).toString().substring(0, 9)}
                </span>
              </p>
              {type === "input" && (
                <button
                  ref={buttonRef}
                  type="button"
                  onClick={() =>
                    formik.setFieldValue(
                      "inputAmount",
                      formatUnits(balance!, decimals!).toString()
                    )
                  }
                  className="p-0 text-sm font-bold text-teal-300 focus:outline-none hover:font-semibold"
                >
                  Max
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FieldWrapper;
