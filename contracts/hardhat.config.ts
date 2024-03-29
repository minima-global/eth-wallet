import "dotenv/config";
import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-toolbox-viem";

// npx hardhat fundme --network localhost to fund non-ephemeral network
// task("fundme", "Fund my eth a/c", async (taskArgs, hre) => {
  
//   console.log('current block number', await hre.ethers.getDefaultProvider().getBlockNumber());

//   // whales
//   const minima = await hre.ethers.getImpersonatedSigner(
//     "0x5534fF8d19EBF33D8e57C552f88d3A5dEE4fb669"
//   ); // minima
//   const ether = await hre.ethers.getImpersonatedSigner(
//     "0xBcd4042DE499D14e55001CcbB24a551F3b954096"
//   ); // hardhat

//   console.log(ether);
//   // contracts
//   const minimaContract = new hre.ethers.Contract(
//     "0x669c01CAF0eDcaD7c2b8Dc771474aD937A7CA4AF",
//     ERC20__ABI,
//     minima
//   );

//   // fund the whales to pay for gas
//   await ether.sendTransaction({
//     to: "0x5534fF8d19EBF33D8e57C552f88d3A5dEE4fb669",
//     value: hre.ethers.parseUnits("1000", "ether"),
//   });
//   await ether.sendTransaction({
//     to: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
//     value: hre.ethers.parseUnits("1000", "ether"),
//   });

//   const myAddress = "0xE6001ca8Cd546107F29eafc7a8fD4a57826913DA";

//   console.log('Whale Minima Balance:', await minimaContract.balanceOf("0x5534fF8d19EBF33D8e57C552f88d3A5dEE4fb669"));  

//   await ether.sendTransaction({
//     to: myAddress,
//     value: hre.ethers.parseUnits("1000", "ether"),
//   });

//   await minimaContract.transfer(
//     myAddress,
//     hre.ethers.parseUnits("1000", "ether")
//   );

//   console.log('Our Minima Balance:', await minimaContract.balanceOf(myAddress));

// });


task("fundme", "Fund my Ethereum account with Ethereum & Wrapped Minima").addParam("account", "Your Ghost Wallet Address")
.setAction(async (taskArgs, hre) => {
  console.log(taskArgs);
  const { account } = taskArgs;
  try {
    hre.ethers.getAddress(account);
    console.log('Current Block Number, ', await hre.ethers.getDefaultProvider().getBlockNumber());

    // whales
  const minima = await hre.ethers.getImpersonatedSigner(
    "0x5534fF8d19EBF33D8e57C552f88d3A5dEE4fb669"
  ); // minima
  const ether = await hre.ethers.getImpersonatedSigner(
    "0xBcd4042DE499D14e55001CcbB24a551F3b954096"
  ); // hardhat

  // contracts
  const minimaContract = new hre.ethers.Contract(
    "0x669c01CAF0eDcaD7c2b8Dc771474aD937A7CA4AF",
    ERC20__ABI,
    minima
  );

  // fund the whales to pay for gas
  await ether.sendTransaction({
    to: "0x5534fF8d19EBF33D8e57C552f88d3A5dEE4fb669",
    value: hre.ethers.parseUnits("1000", "ether"),
  });
  await ether.sendTransaction({
    to: "0xF977814e90dA44bFA03b6295A0616a897441aceC",
    value: hre.ethers.parseUnits("1000", "ether"),
  });

  console.log('Whale Minima Balance:', await minimaContract.balanceOf("0x5534fF8d19EBF33D8e57C552f88d3A5dEE4fb669"));  

  await ether.sendTransaction({
    to: account,
    value: hre.ethers.parseUnits("1000", "ether"),
  });

  await minimaContract.transfer(
    account,
    hre.ethers.parseUnits("1000", "ether")
  );

  console.log('Our Minima Balance:', await minimaContract.balanceOf(account));
    
  } catch (error) {
    
    if (error instanceof Error) {
      return console.error(error.message);
    }

    return console.error("Something went wrong, please try again");
  }


});

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    // goerli: {
    //   url: `https://goerli.infura.io/v3/${INFURA_API_KEY}`,
    //   accounts: [SEPOLIA_PRIVATE_KEY!],
    // },
    // sepolia: {
    //   url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
    //   accounts: [SEPOLIA_PRIVATE_KEY!],
    // },
    hardhat: {
      chainId: 1,
      forking: {
        url: "https://mainnet.infura.io/v3/05c98544804b478994665892aeff361c",
        blockNumber: 19517782,
      }
    },
  },
};

export default config;
const ERC20__ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "allowance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "needed",
        type: "uint256",
      },
    ],
    name: "ERC20InsufficientAllowance",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "needed",
        type: "uint256",
      },
    ],
    name: "ERC20InsufficientBalance",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "approver",
        type: "address",
      },
    ],
    name: "ERC20InvalidApprover",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
    ],
    name: "ERC20InvalidReceiver",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "ERC20InvalidSender",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "ERC20InvalidSpender",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];