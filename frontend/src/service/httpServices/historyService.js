import httpRequest from "../../utils/httpRequest";

export default {
    getUserHistory: async (userAddress, page, perPage) => {
        const options = {
            method: "GET",
            url: `/history/${userAddress}`,
            params: { page, perPage },
        };
        return httpRequest(options).then((res) => {
            // console.log("data", res.data);
            return res.data;
        });
    },

    getHistoryFilter: async (userAddress, filter, page, perPage) => {
        const options = {
            method: "GET",
            url: `/history/${userAddress}/filter`,
            params: { ...filter, page, perPage },
        };
        return httpRequest(options).then((res) => {
            // console.log("data", res.data);
            return res.data;
        });
    },

    adminGetHistory: async (userAddress, page, perPage) => {
        const options = {
            method: "GET",
            url: `/history/admin/${userAddress}`,
            params: { page, perPage },
        };
        return httpRequest(options).then((res) => {
            return res.data;
        });
    },

    adminGetHistoryFilter: async (userAddress, filter, page, perPage) => {
        const options = {
            method: "GET",
            url: `/history/admin/${userAddress}/filter`,
            params: { ...filter, page, perPage },
        };
        console.log("filter as admin");
        return httpRequest(options).then((res) => {
            return res.data;
        });
    },
};
