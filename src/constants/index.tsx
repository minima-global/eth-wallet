import { Asset } from "../types/Asset";
import { Network, Networks } from "../types/Network";

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

export const etherscan = {
  mainnet: {
    rpc: "https://etherscan.io/address/"
  },
  sepolia: {
    rpc: "https://sepolia.etherscan.io/address/"
  },
  goerli: {
    rpc: "https://goerli.etherscan.io/address/"
  }
}
export const networks: Networks = {
  mainnet: {
    name: "Ethereum",
    rpc: "https://mainnet.infura.io/v3/05c98544804b478994665892aeff361c",
    chainId: "1",
    symbol: "ETH"
  },
  sepolia: {
    name: "Sepolia",
    rpc: "https://sepolia.infura.io/v3/05c98544804b478994665892aeff361c",
    chainId: "11155111",
    symbol: "Sepolia ETH"
  }
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
  }
};

export default defaultAssetsStored;
