import { MaxUint256 } from "ethers";
import { useFormikContext } from "formik";
import { useState } from "react";

interface Props {
  token: JSX.Element;
  extraClass?: string;
  disabled?: boolean;
  reviewMode?: boolean;
}
const ApproveFieldWrapper = ({
  reviewMode,
  disabled,
  extraClass,
  token,
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
          Approve amount
        </label>
        <input
          disabled={true}
          {...formik.getFieldProps("amount")}
          onBlur={() => setF(false)}
          onFocus={() => setF(true)}
          placeholder="0"
          className="text-2xl truncate bg-gray-800 font-mono focus:border-none focus:outline-none placeholder:text-teal-300 font-bold"
        />
      </div>
      <div className=" bg-gray-700 bg-opacity-10 pb-0 grid grid-rows-[1fr_auto]">
        <div className="m-auto">{token}</div>
        {!reviewMode && (
          <div className="grid items-center pb-2">
            <button
              type="button"
              onClick={() =>
                formik.setFieldValue("amount", MaxUint256.toString())
              }
              className="p-0 text-sm font-bold text-teal-300 focus:outline-none hover:font-semibold"
            >
              Max
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApproveFieldWrapper;
