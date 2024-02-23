import { Asset } from "../types/Asset";

const defaultAssetsStored: Asset[] = [
  {
    name: "Ethereum",
    symbol: "ETH",
    balance: "",
    address: "",
    decimals: 18,
    type: "ether",
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
  },
  {
    name: "wMinima",
    symbol: "WMINIMA",
    balance: "",
    address: "",
    decimals: 18,
    type: "erc20",
    icon: (
      <img
        alt="token-icon"
        src="./assets/token.svg"
        className="w-[36px] h-[36px] rounded-full"
      />
    ),
  },
  {
    name: "Tether",
    symbol: "USDT",
    balance: "",
    address: "",
    decimals: 18,
    type: "erc20",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"        
        width="32"
        height="32"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M14.08 20.188c-1.15 1.083 -3.02 1.083 -4.17 0l-6.93 -6.548c-.96 -.906 -1.27 -2.624 -.69 -3.831l2.4 -5.018c.47 -.991 1.72 -1.791 2.78 -1.791h9.06c1.06 0 2.31 .802 2.78 1.79l2.4 5.019c.58 1.207 .26 2.925 -.69 3.83c-3.453 3.293 -3.466 3.279 -6.94 6.549z" />
        <path d="M12 15v-7" />
        <path d="M8 8h8" />
      </svg>
    ),
  },
];

export default defaultAssetsStored;
