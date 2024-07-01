import { ReactNode, useState } from "react";

interface Props {
  label: string;
  inputProps: any;
  action?: ReactNode;
  wrapperStyle?: string;
  errors: false | string;
}

const InputWrapper = ({
  label,
  inputProps,
  action,
  wrapperStyle,
  errors,
}: Props) => {
  const [_f, setF] = useState(false);

  const hasAction = !!action;


  return (
    <div>
      <div
        className={`${wrapperStyle} ${
          errors && "outline !outline-red-500"
        } grid ${_f ? "outline dark:outline-yellow-300" : ""} ${
          hasAction ? "sm:grid-cols-[1fr_minmax(0,_120px)]" : "grid-cols-1"
        } rounded bg-gray-100 bg-opacity-50 dark:bg-[#1B1B1B]`}
      >
        <div className="px-4 py-4">
          <label
            className={`${errors && "!text-red-500"} ${
              _f ? "dark:text-yellow-300" : ""
            } font-bold text-sm dark:opacity-70`}
          >
            {label}
          </label>
          <input
            {...inputProps}
            className="bg-gray-100 font-mono bg-opacity-50 dark:bg-[#1B1B1B] truncate w-full focus:outline-none max-w"
            onBlur={(e) => {
              inputProps.onBlur(e);
              setF(false);
            }}
            onFocus={() => setF(true)}
          />
        </div>
        {action}
      </div>
      {errors && (
        <p className="my-2 bg-red-600 text-white font-bold rounded p-2">
          {errors}
        </p>
      )}
    </div>
  );
};

export default InputWrapper;
