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

export const networks = {
  mainnet: {
    rpc: "https://mainnet.infura.io/v3/05c98544804b478994665892aeff361c",
    chainId: 1,
  },
  sepolia: {
    rpc: "https://sepolia.infura.io/v3/05c98544804b478994665892aeff361c",
    chainId: "11155111",
  },
  unknown: {
    rpc: "http://127.0.0.1:8545",
    chainId: "31337",
  },
};
// default assets..
export const _defaults = {
  wMinima: {
    mainnet: "0x669c01CAF0eDcaD7c2b8Dc771474aD937A7CA4AF",
    sepolia: "0x2Bf712b19a52772bF54A545E4f108e9683fA4E2F",
  },
  Tether: {
    mainnet: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    sepolia: "0xb3BEe194535aBF4E8e2C0f0eE54a3eF3b176703C",
  },
  unknown: {
    mainnet: "",
    sepolia: "",
  },
};

export default defaultAssetsStored;
