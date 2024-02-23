import 'dotenv/config';
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-toolbox-viem";


const {INFURA_API_KEY, SEPOLIA_PRIVATE_KEY} = process.env;

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY!]
    },
    hardhat: {
      forking: {
        url: "https://mainnet.infura.io/v3/05c98544804b478994665892aeff361c",
      },
      initialBaseFeePerGas: 0,
    }
  }
};

export default config;
