import { create } from "zustand";

const useFilter = create((set) => ({
    filter: {
        hash: "",
        event: [],
        block: [],
    },
    setFilter: (data) => set({ filter: data }),
}));

export default useFilter;
