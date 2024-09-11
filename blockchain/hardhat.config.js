require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

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
    networks: {
        tBNB: {
            url: process.env.BSC_TESTNET_URL,
            accounts: [
                `${
                    process.env.PRIVATE_KEY.startsWith("0x")
                        ? process.env.PRIVATE_KEY
                        : "0x" + process.env.PRIVATE_KEY
                }`,
            ],
            chainId: 97,
        },
    },
};
