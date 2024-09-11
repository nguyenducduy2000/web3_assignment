import { create } from "zustand";

const useHistory = create((set) => ({
    history: [],
    methods: ["Deposited", "NFTMinted", "NFTDeposited", "Withdrawn", "NFTWithdrawn", "RewardClaimed"],
    setHistory: (data) => set({ history: data }),
}));

export default useHistory;
