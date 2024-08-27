// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const path = require("path");

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
    console.log(
        "Deploying the contracts with the account:",
        await deployer.getAddress()
    );

    // console.log("Account balance:", (await deployer.getBalance()).toString());

    // deploy TokenA
    const TokenA = await ethers.getContractFactory("TokenA");
    const tokenA = await TokenA.deploy();
    await tokenA.waitForDeployment();
    console.log("tokenA address:", await tokenA.getAddress());

    // deploy TokenB
    const TokenB = await ethers.getContractFactory("TokenB");
    const tokenB = await TokenB.deploy();
    await tokenB.waitForDeployment();
    console.log("tokenB address:", await tokenB.getAddress());

    // deploy Staking
    const Staking = await ethers.getContractFactory("Staking");
    const staking = await Staking.deploy(
        tokenA.getAddress(),
        tokenB.getAddress()
    );
    await staking.waitForDeployment();
    console.log("staking address:", await staking.getAddress());

    // We also save the contract's artifacts and address in the frontend directory
    saveFrontendFiles({
        TokenA: await tokenA.getAddress(),
        TokenB: await tokenB.getAddress(),
        Staking: await staking.getAddress(),
    });
    saveBackendFiles({
        TokenA: await tokenA.getAddress(),
        TokenB: await tokenB.getAddress(),
        Staking: await staking.getAddress(),
    });
}

function saveFrontendFiles(addresses) {
    const fs = require("fs");
    const contractsDir = path.join(
        __dirname,
        "..",
        "..",
        "frontend",
        "src",
        "contracts"
    );

    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir);
    }

    fs.writeFileSync(
        path.join(contractsDir, "contract-address.json"),
        JSON.stringify(addresses, undefined, 2)
    );

    myArtifact = ["TokenA", "TokenB", "Staking"];

    myArtifact.forEach((artifact) => {
        const TokenArtifact = artifacts.readArtifactSync(artifact);
        fs.writeFileSync(
            path.join(contractsDir, `${artifact}.json`),
            JSON.stringify(TokenArtifact, null, 2)
        );
    });
}

function saveBackendFiles(addresses) {
    const fs = require("fs");
    const contractsDir = path.join(
        __dirname,
        "..",
        "..",
        "backend",
        "contracts"
    );

    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir);
    }

    fs.writeFileSync(
        path.join(contractsDir, "contract-address.json"),
        JSON.stringify(addresses, undefined, 2)
    );

    myArtifact = ["TokenA", "TokenB", "Staking"];

    myArtifact.forEach((artifact) => {
        const TokenArtifact = artifacts.readArtifactSync(artifact);
        fs.writeFileSync(
            path.join(contractsDir, `${artifact}.json`),
            JSON.stringify(TokenArtifact, null, 2)
        );
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
