import { ethers } from "hardhat";



async function main() {
  // const [deployer] = await ethers.getSigners();

  // console.log("Deploying contracts with the account:", deployer.address);
  // const wMinima = await ethers.deployContract("wMinima");
  // const tether = await ethers.deployContract("Tether");

    // whales
    // const minima =  await ethers.getImpersonatedSigner("0x5534fF8d19EBF33D8e57C552f88d3A5dEE4fb669"); // minima
    const ether = await ethers.getImpersonatedSigner("0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec"); // hardhat
    // const usdt = await ethers.getImpersonatedSigner("0xF977814e90dA44bFA03b6295A0616a897441aceC"); // binance

    console.log(ether);
    // contracts
    // const minimaContract = new ethers.Contract("0x669c01CAF0eDcaD7c2b8Dc771474aD937A7CA4AF", ERC20__ABI, minima);
    // const usdtContract = new ethers.Contract("0xdac17f958d2ee523a2206206994597c13d831ec7", ERC20__ABI, usdt);

    const myAddress = "0xE6001ca8Cd546107F29eafc7a8fD4a57826913DA";

    // await minimaContract.transfer(
    //   myAddress,
    //   ethers.parseUnits("1000", "ether"),      
    // );
    // await usdtContract.transfer(
    //   myAddress,
    //   ethers.parseUnits("1000", "ether"),      
    // );
    const tx = await ether.sendTransaction({
      to: myAddress,
      value:  ethers.parseUnits("1000", "ether"),
    })

    console.log(await tx.wait());



  // console.log("wMinima Contract address:", await wMinima.getAddress());
  // console.log("Tether Contract address:", await tether.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });