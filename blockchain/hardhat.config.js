require("@nomicfoundation/hardhat-toolbox");
// require("dotenv").config();

// The next line is part of the sample project, you don't need it in your
// project. It imports a Hardhat task definition, that can be used for
// testing the frontend.
// require("./tasks/faucet");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        compilers: [
            {
                version: "0.8.20",
                settings: {
                    evmVersion: "paris",
                },
            },
        ],
    },
    // networks: {
    //     // sepolia: {
    //     //     url: process.env.ETHERIUM_SEPOLIA_URL,
    //     //     accounts: [process.env.PRIVATE_KEY],
    //     // },
    //     tBSC: {
    //         url: process.env.BSC_TESTNET_URL,
    //         accounts: [`0x${process.env.PRIVATE_KEY}`],
    //         chainId: 97,
    //         gas: 2100000,
    //         gasPrice: 8000000000,
    //     },
    //     linearSepolia: {
    //         url: `https://linea-sepolia.infura.io/v3/${process.env.INFURA_KEY}`,
    //         accounts: [`0x${process.env.PRIVATE_KEY}`],
    //         gasPrice: 50000000000,
    //     },
    // },
};
