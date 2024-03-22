import { useState } from "react";

interface Props {
  type: "input" | "output";
  token: JSX.Element;
  balance?: string;
  extraClass?: string;
}
const FieldWrapper = ({ extraClass, type, token, balance }: Props) => {
  const [f, setF] = useState(false);
  console.log(token);
  return (
    <div
      className={`${
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
          onBlur={() => setF(false)}
          onFocus={() => setF(true)}
          placeholder="0"
          className="text-2xl truncate bg-gray-800 font-mono focus:border-none focus:outline-none placeholder:text-teal-300 font-bold"
        />
      </div>
      <div className="my-auto bg-gray-700 bg-opacity-10  p-4 grid grid-rows-[1fr_auto]">
        <div>{token}</div>
        <p className="text-sm font-bold text-gray-500">Balance: <span className="font-mono">{balance}</span></p>
      </div>
    </div>
  );
};

export default FieldWrapper;
