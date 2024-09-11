// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

require("dotenv").config();
const path = require("path");
const fs = require("fs");

async function main() {
    // This is just a convenience check
    if (network.name === "hardhat") {
        console.warn(
            "You are trying to deploy a contract to the Hardhat Network, which" +
                "gets automatically created and destroyed every time. Use the Hardhat" +
                " option '--network localhost'"
        );
    }

    // ethers is available in the global scope
    const [deployer] = await ethers.getSigners();
    console.log("Deploying the contracts with the account:", deployer.address);

    // console.log("Account balance:", (await deployer.getBalance()).toString());

    // deploy TokenA
    const TokenA = await ethers.getContractFactory("TokenA");
    const tokenA = await TokenA.deploy();
    await tokenA.deployed();
    console.log("tokenA address:", tokenA.address);

    // deploy TokenB
    const TokenB = await ethers.getContractFactory("TokenB");
    const tokenB = await TokenB.deploy();
    await tokenB.deployed();
    console.log("tokenB address:", tokenB.address);

    // deploy Staking
    const Staking = await ethers.getContractFactory("Staking");
    const staking = await Staking.deploy(tokenA.address, tokenB.address);
    const receipt = await staking.deployTransaction.wait();
    console.log("staking address:", staking.address);
    console.log("staking receipt:", receipt.blockNumber);

    // We also save the contract's artifacts and address in the frontend directory
    saveContractAbiFile(
        {
            TokenA: tokenA.address,
            TokenB: tokenB.address,
            Staking: staking.address,
        },
        "frontend"
    );
    saveContractAbiFile(
        {
            TokenA: tokenA.address,
            TokenB: tokenB.address,
            Staking: staking.address,
        },
        "backend"
    );

    // Save the staking contract block number and other data to .env files
    await saveDataToENV(
        {
            BLOCK_NUMBER: receipt.blockNumber,
            CHUNK_PER_CONJOB: 5000,
            OWNER: process.env.PUBLIC_KEY,
        },
        "backend"
    );
    await saveDataToENV(
        {
            INIT_BLOCK: receipt.blockNumber,
            OWNER: process.env.PUBLIC_KEY,
        },
        "frontend"
    );
}

function saveContractAbiFile(addresses, file = "") {
    const fs = require("fs");
    let contractsDir;

    if (file === "frontend") {
        contractsDir = path.join(__dirname, "..", "..", file, "src", "contracts");
    } else if (file === "backend") {
        contractsDir = path.join(__dirname, "..", "..", file, "contracts");
    }

    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir);
    }

    fs.writeFileSync(path.join(contractsDir, "contract-address.json"), JSON.stringify(addresses, undefined, 2));

    myArtifact = ["TokenA", "TokenB", "Staking"];

    myArtifact.forEach((artifact) => {
        const TokenArtifact = artifacts.readArtifactSync(artifact);
        fs.writeFileSync(path.join(contractsDir, `${artifact}.json`), JSON.stringify(TokenArtifact, null, 2));
    });
}

async function saveDataToENV(data, fileName) {
    const envFilePath = path.join(__dirname, "..", "..", fileName, ".env");

    // Read existing .env content or create an empty string if file doesn't exist
    let envContent = fs.existsSync(envFilePath) ? fs.readFileSync(envFilePath, "utf-8") : "";

    for (const [key, value] of Object.entries(data)) {
        const regex = new RegExp(`^${key}=.*$`, "m");
        const newEntry = `${key}=${value}`;

        if (regex.test(envContent)) {
            // Key exists, update the value
            envContent = envContent.replace(regex, newEntry);
            // console.log(`${key} value updated to ${value} in .env file`);
        } else {
            // Key doesn't exist, append it
            envContent += envContent.endsWith("\n") ? newEntry : `\n${newEntry}`;
            // console.log(`${key} added to .env file with value: ${value}`);
        }
    }

    // Write the updated content back to the .env file
    fs.writeFileSync(envFilePath, envContent, "utf-8");
    console.log(`Data saved to .env file: ${envFilePath}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
