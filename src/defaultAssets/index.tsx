import { Asset } from "../types/Asset";

const defaultAssetsStored: Asset[] = [
  {
    name: "Ethereum",
    symbol: "ETH",
    balance: "",
    address: "",
    decimals: 18,
    type: "ether"
  },
  {
    name: "wMinima",
    symbol: "WMINIMA",
    balance: "",
    address: "",
    decimals: 18,
    type: "erc20"
  },
  {
    name: "Tether",
    symbol: "USDT",
    balance: "",
    address: "",
    decimals: 18,
    type: "erc20"
  },
];

export default defaultAssetsStored;
