const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Staking Contract", function () {
    let TokenA, tokenA, TokenB, tokenB, Staking, staking;
    let owner, user1, user2;
    const LOCK_PERIOD = 30; // seconds
    const NFT_THRESHOLD = ethers.utils.parseEther("1000000");
    const BASE_APR = 8; // 8%
    const NFT_BONUS_APR = 2; // 2%

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        TokenA = await ethers.getContractFactory("TokenA");
        tokenA = await TokenA.deploy();
        await tokenA.deployed();

        TokenB = await ethers.getContractFactory("TokenB");
        tokenB = await TokenB.deploy();
        await tokenB.deployed();

        Staking = await ethers.getContractFactory("Staking");
        staking = await Staking.deploy(tokenA.address, tokenB.address);
        await staking.deployed();

        // Give some tokens to users for testing
        await tokenA.transferToUser(
            user1.address,
            ethers.utils.parseEther("2000000")
        );
        await tokenA.transferToUser(
            user2.address,
            ethers.utils.parseEther("2000000")
        );
    });

    describe("Deposit", function () {
        it("Should allow users to deposit tokens", async function () {
            const depositAmount = ethers.utils.parseEther("100000");
            await tokenA.connect(user1).approve(staking.address, depositAmount);
            await expect(staking.connect(user1).deposit(depositAmount))
                .to.emit(staking, "Deposited")
                .withArgs(user1.address, depositAmount);

            const deposits = await staking.deposits(user1.address);
            expect(deposits.amount).to.equal(depositAmount);
        });

        it("Should mint NFT when deposit reaches threshold", async function () {
            const depositAmount = NFT_THRESHOLD;
            await tokenA.connect(user1).approve(staking.address, depositAmount);
            await expect(staking.connect(user1).deposit(depositAmount)).to.emit(
                staking,
                "NFTMinted"
            );

            const nftCount = await tokenB.balanceOf(user1.address);
            expect(nftCount).to.equal(1);
        });
    });

    describe("Deposit NFT", function () {
        it("Should allow users to deposit NFTs", async function () {
            // First, mint an NFT for the user
            const tokenId = await tokenB.mintNFT(user1.address);
            await tokenB
                .connect(user1)
                .approve(staking.address, tokenId.value.toString());
            await expect(
                staking.connect(user1).depositNFT(tokenId.value.toString())
            )
                .to.emit(staking, "NFTDeposited")
                .withArgs(user1.address, tokenId.value.toString());

            const stake = await staking.getDepositedNFTs(user1.address);
            expect(stake.length).to.equal(1);
        });
    });

    describe("Withdraw", function () {
        it("Should not allow withdrawal if lock period is not over yet", async function () {
            const depositAmount = ethers.utils.parseEther("100000");
            await tokenA.connect(user1).approve(staking.address, depositAmount);
            await staking.connect(user1).deposit(depositAmount);

            await expect(staking.connect(user1).withdraw()).to.be.revertedWith(
                "Tokens are still locked"
            );
        });

        it("Should allow withdrawal after lock period", async function () {
            const depositAmount = ethers.utils.parseEther("100000");
            await tokenA.connect(user1).approve(staking.address, depositAmount);
            await staking.connect(user1).deposit(depositAmount);

            // Fast forward time
            await ethers.provider.send("evm_increaseTime", [LOCK_PERIOD + 1]);
            await ethers.provider.send("evm_mine");

            await expect(staking.connect(user1).withdraw()).to.emit(
                staking,
                "Withdrawn",
                "RewardClaimed"
            );

            const deposits = await staking.deposits(user1.address);
            expect(deposits.amount).to.equal(0);
        });
    });

    describe("Rewards calculation", function () {
        it("should calculate rewards correctly", async function () {
            // Initial setup
            const depositAmount = ethers.utils.parseEther("1000");
            await tokenA.connect(user1).approve(staking.address, depositAmount);
            await expect(staking.connect(user1).deposit(depositAmount))
                .to.emit(staking, "Deposited")
                .withArgs(user1.address, depositAmount);

            // Fast-forward time by a year (assuming no NFT deposited)
            const oneYear = 365 * 24 * 60 * 60; // seconds in a year
            await ethers.provider.send("evm_increaseTime", [oneYear]);
            await ethers.provider.send("evm_mine", []);

            // Calculate expected rewards based on BASE_APR and time
            const expectedRewards = depositAmount
                .mul(BASE_APR)
                .mul(oneYear)
                .div(365 * 24 * 60 * 60)
                .div(100);

            // Call the calculateReward function
            const rewards = await staking.calculateReward(user1.address);
            console.log(
                ethers.utils.formatEther(expectedRewards),
                ethers.utils.formatEther(rewards)
            );

            // Assert that the rewards are as expected
            expect(rewards).to.equal(expectedRewards);
        });
    });
});
