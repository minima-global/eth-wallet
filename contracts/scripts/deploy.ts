import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const wMinima = await ethers.deployContract("wMinima");
  const tether = await ethers.deployContract("Tether");

  console.log("wMinima Contract address:", await wMinima.getAddress());
  console.log("Tether Contract address:", await tether.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });