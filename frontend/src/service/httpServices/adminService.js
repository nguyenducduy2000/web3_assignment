import httpRequest from "../../utils/httpRequest";

export default {
    adjustBaseAPR: (userAddress, APR) => {
        const options = {
            method: "GET",
            // url: `/history/${userAddress}`,
            params: { APR },
        };
        return httpRequest(options).then((res) => {
            // console.log("data", res.data);
            return res.data;
        });
    },
};
