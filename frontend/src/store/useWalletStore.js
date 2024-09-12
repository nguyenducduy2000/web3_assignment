import { create } from "zustand";
import { ethers } from "ethers";
import { toast } from "react-toastify";

// Create the zustand store
const useWalletStore = create((set, get) => ({
    provider: null,
    signer: null,
    address: null,
    network: null,
    balance: null,
    latestBlock: null,
    // Function to handle login
    login: async () => {
        try {
            if (!window.ethereum) {
                throw new Error("No MetaMask found");
            }

            const newProvider = new ethers.providers.Web3Provider(window.ethereum);
            await window.ethereum.request({
                method: "eth_requestAccounts",
            });

            const network = await newProvider.getNetwork();
            const newSigner = newProvider.getSigner();
            const newAddress = await newSigner.getAddress();

            // Fetch and set the balance
            // const balanceInWei = await newProvider.getBalance(newAddress);
            // const balanceInEth = ethers.utils.formatEther(balanceInWei);

            set({
                provider: newProvider,
                signer: newSigner,
                address: newAddress,
                network: network,
                // balance: balanceInEth,
            });
            toast.success("Logged in successfully");
            // console.log("provider:", newProvider);
            // console.log("network:", network);
            // console.log("newSigner:", newSigner);
            // console.log("newAddress:", newAddress);
            // console.log("balanceInWei:", balanceInWei);
            // console.log("balanceInEth:", balanceInEth);
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    },

    // Function to handle logout
    logout: () => {
        set({
            provider: null,
            signer: null,
            address: null,
            network: null,
            balance: null,
        });
        toast.info("Logged out successfully");
    },

    getLatestBlock: async () => {
        try {
            const provider = get().provider;
            if (provider) {
                const latestBlock = await provider.getBlockNumber();
                set({ latestBlock: latestBlock });
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    },

    getBalance: async () => {
        try {
            const provider = get().provider;
            const address = get().address;
            if (provider && address) {
                const balanceInWei = await provider.getBalance(address);
                const balanceInEth = ethers.utils.formatEther(balanceInWei);
                set({ balance: balanceInEth });
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    },
}));

export default useWalletStore;
