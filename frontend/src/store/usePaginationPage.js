import { create } from "zustand";

const usePaginationPage = create((set) => ({
    paginationPage: {
        total: 0,
        perPage: 10,
        currentPage: 1,
        lastPage: 0,
        firstPage: null,
        firstPageUrl: null,
        lastPageUrl: null,
        nextPageUrl: null,
        previousPageUrl: null,
    },

    setPaginationPage: (data) => set({ paginationPage: data }),

    setCurrentPage: (page) =>
        set((state) => ({
            paginationPage: {
                ...state.paginationPage,
                currentPage: page,
            },
        })),

    // setPerPage: (perPage) =>
    //     set((state) => ({
    //         paginationPage: {
    //             ...state.paginationPage,
    //             perPage,
    //         },
    //     })),

    setSizeChange: (page, perPage) =>
        set((state) => ({
            paginationPage: {
                ...state.paginationPage,
                currentPage: page,
                perPage,
            },
        })),
}));

export default usePaginationPage;
