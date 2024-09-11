import httpRequest from "../../utils/httpRequest";

export default {
    getUserHistory: (userAddress, page, perPage) => {
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

    getHistoryFilter: (userAddress, filter, page, perPage) => {
        const options = {
            method: "POST",
            url: `/history/${userAddress}/filter`,
            params: { ...filter, page, perPage },
        };
        return httpRequest(options).then((res) => {
            // console.log("data", res.data);
            return res.data;
        });
    },
};
