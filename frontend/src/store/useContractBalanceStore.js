import { create } from "zustand";
import { ethers } from "ethers";
import contractAddress from "../contracts/contract-address.json";
import { toast } from "react-toastify";
import TokenAArtifact from "../contracts/TokenA.json";
import TokenBArtifact from "../contracts/TokenB.json";
import StakingArtifact from "../contracts/Staking.json";

const useContractBalanceStore = create((set, get) => ({
    totalSupply: null,
    tokenA: null,
    tokenB: null,
    depositedTokenA: null,
    depositedTokenB: [],
    stakingBalance: null,
    APR: null,
    depositCounter: null,
    depositReward: null,
    depositTimestamp: null,
    ownedNFTs: [],
    locktime: null,
    nftTimestamp: null,
    fixedGaslimit: 9000000,

    // Function to fetch and set contract balances
    fetchBalances: async (signer, address) => {
        try {
            const { TokenA, TokenB, Staking } = contractAddress;

            // Fetch TokenA balance
            const TokenAContract = new ethers.Contract(TokenA, TokenAArtifact.abi, signer);
            const tokenA = await TokenAContract.balanceOf(address);
            const totalSupply = await TokenAContract.balanceOf(TokenA);

            // Fetch TokenB balance
            const TokenBContract = new ethers.Contract(TokenB, TokenBArtifact.abi, signer);
            const tokenB = await TokenBContract.balanceOf(address);

            // Fetch Staking balance and deposit info
            const stakingContract = new ethers.Contract(Staking, StakingArtifact.abi, signer);
            const depositInfo = await stakingContract.deposits(address);
            const depositedTokenB = await stakingContract.getDepositedNFTs(address);

            // Parse the deposit info
            const [counter, amount, reward, timestamp, nftTimestamp, userAPR] = depositInfo.toString().split(",");
            // Convert to a Date object;
            const locktime = parseInt(timestamp) + 300;
            const dateTime = new Date(locktime * 1000); // Multiply by 1000 to convert seconds to milliseconds
            // Convert to a human-readable string
            const formattedDate = dateTime.toLocaleString(); // Local date and time string
            const nftDate = new Date(parseInt(nftTimestamp) * 1000);
            // Update the state with the fetched balances and deposit info
            get().fetchOwnedNFTs(signer, address);
            set({
                totalSupply: await ethers.utils.formatEther(totalSupply),
                tokenA: await ethers.utils.formatEther(tokenA),
                tokenB: tokenB,
                depositedTokenA: await ethers.utils.formatEther(amount), // This is the amount field from DepositInfo
                depositedTokenB: depositedTokenB
                    .toString()
                    .split(",")
                    .filter((token) => token !== ""),
                stakingBalance: amount, // Same as depositedTokenA in this case
                APR: userAPR.toString(),
                depositCounter: counter,
                depositReward: ethers.utils.formatEther(reward),
                depositTimestamp: timestamp,
                locktime: formattedDate,
                nftTimestamp: nftDate.toLocaleString(),
            });
        } catch (error) {
            console.error("Failed to fetch balances:", error);
            toast.error(error.message);
        }
    },

    // Function to transfer TokenA to the user's wallet and update balance
    transferTokensToUser: async (signer, recipient, amount) => {
        try {
            const { TokenA } = contractAddress;
            console.log("signer:", signer);

            const TokenAContract = new ethers.Contract(TokenA, TokenAArtifact.abi, signer);

            const amountWei = ethers.utils.parseEther(amount);
            // Perform the transfer
            const tx = await TokenAContract.transferToUser(recipient, amountWei, {
                gasLimit: get().fixedGaslimit,
            });
            await tx.wait(); // Wait for the transaction to be mined

            // Fetch the updated balance
            const updatedBalance = await TokenAContract.balanceOf(recipient);

            // Update the state with the new balance
            set({ tokenA: updatedBalance.toString() });

            toast.success(`Successfully transferred ${amount} ETH to ${recipient}`);
        } catch (error) {
            console.error("Failed to transfer tokens:", error);
            toast.error(error.message);
        }
    },

    // Function to deposit tokens
    depositTokenA: async (signer, amount) => {
        try {
            const { TokenA, Staking } = contractAddress;

            // Create contract instances
            const TokenAContract = new ethers.Contract(TokenA, TokenAArtifact.abi, signer);
            const StakingContract = new ethers.Contract(Staking, StakingArtifact.abi, signer);

            const userAddress = await signer.getAddress();
            const currentAllowance = await TokenAContract.allowance(userAddress, Staking);

            const amountWei = ethers.utils.parseEther(amount);
            console.log("amount:", amount);
            console.log("amountWei:", amountWei.toString());

            // If current allowance is less than the amount to deposit, request approval
            if (currentAllowance.lt(amountWei)) {
                const approveTx = await TokenAContract.approve(Staking, amountWei, {
                    gasLimit: get().fixedGaslimit,
                });
                await approveTx.wait();
                toast.success("Approval successful. Please confirm the deposit transaction.");
            }

            // Then, perform the deposit
            const depositTx = await StakingContract.deposit(amountWei, {
                gasLimit: get().fixedGaslimit,
            });
            await depositTx.wait();

            toast.success(`Successfully deposited ${ethers.utils.formatEther(amountWei)} Token A`);

            // Update balances after deposit
            await get().fetchBalances(signer, await signer.getAddress());
        } catch (error) {
            console.error("Failed to transfer tokens:", error);
            toast.error(error.message);
        }
    },

    withdraw: async (signer) => {
        try {
            const { Staking } = contractAddress;

            // Create contract instance
            const StakingContract = new ethers.Contract(Staking, StakingArtifact.abi, signer);

            // Perform the withdrawal
            const withdrawTx = await StakingContract.withdraw();

            // Wait for the transaction to be mined
            const receipt = await withdrawTx.wait();

            if (receipt.status === 1) {
                toast.success(`Successfully withdrawn tokens`);
                await get().fetchBalances(signer, await signer.getAddress());
            } else {
                throw new Error("Transaction failed");
            }
        } catch (error) {
            console.error("Failed to transfer tokens:", error);
            toast.error(error.message);
        }
    },

    depositTokenB: async (signer, tokenId) => {
        try {
            const { TokenB, Staking } = contractAddress;

            const TokenBContract = new ethers.Contract(TokenB, TokenBArtifact.abi, signer);

            const StakingContract = new ethers.Contract(Staking, StakingArtifact.abi, signer);

            const approveTx = await TokenBContract.approve(Staking, tokenId, {
                gasLimit: get().fixedGaslimit,
            });
            await approveTx.wait();
            toast.success("Approval successful. Please confirm the deposit transaction.");

            // Perform the deposit
            // console.log("tokenId:", tokenId);
            const depositTx = await StakingContract.depositNFT(tokenId);
            const receipt = await depositTx.wait();

            if (receipt.status === 1) {
                toast.success(`Successfully deposited Token ${tokenId}`);
                // Update balances after deposit
                await get().fetchBalances(signer, await signer.getAddress());
                return true;
            } else {
                throw new Error("Transaction failed");
            }
        } catch (error) {
            console.error("Failed to transfer tokens:", error);
            toast.error(error.message);
        }
    },

    withdrawTokenB: async (signer, tokenId) => {
        try {
            const { Staking } = contractAddress;

            // Create contract instance
            const StakingContract = new ethers.Contract(Staking, StakingArtifact.abi, signer);

            // Perform the withdrawal
            const withdrawTx = await StakingContract.withdrawNFT(tokenId, {
                gasLimit: get().fixedGaslimit,
            });
            // Wait for the transaction to be mined
            const receipt = await withdrawTx.wait();

            if (receipt.status === 1) {
                toast.success(`Successfully withdrawn Token: ${tokenId}`);
                // Update balances after withdrawal
                await get().fetchBalances(signer, await signer.getAddress());
            } else {
                throw new Error("Transaction failed");
            }
        } catch (error) {
            console.error("Failed to transfer tokens:", error);
            toast.error(error.message);
        }
    },

    fetchOwnedNFTs: async (signer, address) => {
        try {
            const { TokenB } = contractAddress;

            const TokenBContract = new ethers.Contract(TokenB, TokenBArtifact.abi, signer);

            const balance = await TokenBContract.balanceOf(address);
            const ownedNFTs = [];
            let tokenId = 0;

            while (ownedNFTs.length < balance) {
                // check owner of tokenId to see if the owner is the same as the address
                const owner = await TokenBContract.ownerOf(tokenId);
                console.log("owner:", owner);

                if (owner === address) {
                    ownedNFTs.push(tokenId);
                }
                tokenId++;

                if (tokenId > 10000) {
                    throw new Error("Exceeded maximum number of NFTs");
                }
            }

            set({
                ownedNFTs: Array.from(ownedNFTs),
            });
        } catch (error) {
            console.error("Error fetching owned NFTs:", error);
            toast.error("Failed to fetch owned NFTs");
        }
    },

    claimReward: async (signer) => {
        try {
            const { Staking } = contractAddress;

            // Create contract instance
            const StakingContract = new ethers.Contract(Staking, StakingArtifact.abi, signer);

            // perform the claim reward
            const claimTx = await StakingContract.claimReward();
            const receipt = await claimTx.wait();
            if (receipt.status === 1) {
                toast.success(`Successfully claim reward`);
                // Update balances after withdrawal
                await get().fetchBalances(signer, await signer.getAddress());
                await get().fetchOwnedNFTs(signer, await signer.getAddress());
            }
        } catch (error) {
            console.error("Failed to withdraw tokens:", error);
            toast.error(error.message);
        }
    },

    // Reset balances on logout
    resetBalances: () => {
        set({
            depositedTokenA: null,
            depositedTokenB: null,
            stakingBalance: null,
        });
    },
}));

export default useContractBalanceStore;
