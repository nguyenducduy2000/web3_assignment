import { create } from "zustand";

const unlockTransaction = create((set) => ({
    isUnlocked: false,
    setIsUnlocked: (data) => set({ isUnlocked: data }),
}));

export default unlockTransaction;
