import { useFormikContext } from "formik";
import { useEffect, useRef, useState } from "react";
import { useSpring, animated, config } from "react-spring";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";

const TokenAssets = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
        <g fill="none" fillRule="evenodd">
          <circle cx="16" cy="16" r="16" fill="#627EEA" />
          <g fill="#FFF" fillRule="nonzero">
            <path fillOpacity=".602" d="M16.498 4v8.87l7.497 3.35z" />
            <path d="M16.498 4L9 16.22l7.498-3.35z" />
            <path fillOpacity=".602" d="M16.498 21.968v6.027L24 17.616z" />
            <path d="M16.498 27.995v-6.028L9 17.616z" />
            <path
              fillOpacity=".2"
              d="M16.498 20.573l7.497-4.353-7.497-3.348z"
            />
            <path fillOpacity=".602" d="M9 16.22l7.498 4.353v-7.701z" />
          </g>
        </g>
      </svg>
    ),
    name: "Ethereum",
    symbol: "ETH",
  },
  {
    icon: (
      <img
        alt="token-icon"
        src="./assets/token.svg"
        className="w-[36px] h-[36px] rounded-full"
      />
    ),
    name: "wMinima",
    symbol: "WMINIMA",
  },
];

const SelectAsset = () => {
  const formik: any = useFormikContext();
  const [active, setActive] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { _balance, _wrappedMinimaBalance } = useWalletContext();

  const springProps = useSpring({
    opacity: active ? 1 : 0,
    transform: active
      ? "translateY(0%)"
      : "translateY(-50%)",
    config: config.stiff,
  });

  const handleButtonClick = () => {
    setActive((prevState) => !prevState);
  };
  
  const handleSelect = (asset: string) => {
    formik.setFieldValue("asset", asset);
    setActive(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block w-full">
      <button
        type="button"
        id="options-menu"
        aria-haspopup="true"
        aria-expanded="true"
        onClick={handleButtonClick}
        className="mt-4 border-2 border-[#464C4F] items-center grid gap-2 grid-cols-[auto_1fr_auto] break-all p-4 rounded-full hover:!border-teal-500 hover:border-4 w-full hover:outline-none"
      >
        {formik.values.asset === "ether" && TokenAssets[0].icon}
        {formik.values.asset === "minima" && TokenAssets[1].icon}
        <div className="flex flex-col text-left">
          <h6 className="m-0 p-0 font-bold text-black dark:text-white">
            {formik.values.asset === "ether" && TokenAssets[0].name}
            {formik.values.asset === "minima" && TokenAssets[1].name}
          </h6>
          <p className="m-0 p-0 text-sm font-mono text-black dark:text-white">
            {formik.values.asset === "ether" && _balance}
            {formik.values.asset === "minima" && _wrappedMinimaBalance}
          </p>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="fill-black dark:fill-white"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M6 10l6 6l6 -6h-12" />
        </svg>
      </button>

      {active && (
        <animated.div
          style={springProps}
          className="origin-top-right z-[50] w-full absolute right-0 mt-2 rounded-md shadow-lg bg-black dark:bg-white"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
        >
          <ul>
            <li onClick={() => handleSelect('ether')} className="p-4 grid grid-cols-[auto_1fr] gap-2 items-center break-all hover:bg-white  hover:bg-opacity-10 dark:hover:bg-opacity-10 dark:hover:bg-teal-300">
              {TokenAssets[0].icon}
              <div>
                <h6 className="m-0 p-0 font-bold text-white dark:text-black">{TokenAssets[0].name}</h6>
                <p className="m-0 p-0 text-sm opacity-80 font-mono text-white dark:text-black">{_balance}</p>
              </div>
            </li>
            <li onClick={() => handleSelect('minima')}  className="p-4 grid grid-cols-[auto_1fr] gap-2 items-center break-all hover:bg-white hover:bg-opacity-10 dark:hover:bg-opacity-10 dark:hover:bg-teal-300">
              {TokenAssets[1].icon}
              <div>
                <h6 className="m-0 p-0 font-bold text-white dark:text-black">{TokenAssets[1].name}</h6>
                <p className="m-0 p-0 text-sm opacity-80 font-mono text-white dark:text-black">{_wrappedMinimaBalance}</p>
              </div>
            </li>
          </ul>
        </animated.div>
      )}
    </div>
  );
};

export default SelectAsset;
