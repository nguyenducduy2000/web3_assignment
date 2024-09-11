// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

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
    saveFrontendFiles({
        TokenA: tokenA.address,
        TokenB: tokenB.address,
        Staking: staking.address,
    });
    saveBackendFiles({
        TokenA: tokenA.address,
        TokenB: tokenB.address,
        Staking: staking.address,
    });
    // Save the staking contract block number to config file
    await saveStakingContractBlockNumber(receipt.blockNumber);
}

function saveFrontendFiles(addresses) {
    const fs = require("fs");
    const contractsDir = path.join(__dirname, "..", "..", "frontend", "src", "contracts");

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

function saveBackendFiles(addresses) {
    const fs = require("fs");
    const contractsDir = path.join(__dirname, "..", "..", "backend", "contracts");

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

async function saveStakingContractBlockNumber(blockNumber) {
    console.log("Staking contract deployed at block number:", blockNumber);

    const configFilePath = path.join(__dirname, "..", "..", "backend", "config.ts");
    let config = {};

    // Load existing configuration if the file exists
    if (fs.existsSync(configFilePath)) {
        try {
            const existingConfig = await import(`file://${configFilePath}`);
            config = existingConfig.default || {}; // Handle default exports
        } catch (err) {
            console.error("Error loading config file:", err);
        }
    }

    // Add or update the necessary fields
    config.BLOCK_NUMBER = blockNumber;
    config.CHUNK_PER_CONJOB = 5000;

    // Convert the config object to an ES module format
    const configContent = `export default ${JSON.stringify(config, null, 2)};`;

    // Write (overwrite) the updated config to the file
    fs.writeFileSync(configFilePath, configContent, "utf8");
    console.log("Block number and chunkPerConjob saved to config file:", configFilePath);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
