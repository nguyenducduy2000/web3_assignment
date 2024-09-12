import { Content } from "antd/es/layout/layout";
import { Table, Tag, Pagination, Flex, Spin, Switch } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { historyService } from "../../service/httpServices";
import { toast } from "react-toastify";
import useWalletStore from "../../store/useWalletStore";
import { usePaginationPage, useHistory, useFilter } from "../../store";
import { useNavigate } from "react-router-dom";
import Filter from "../../components/Filter/";
// import { ethers } from "ethers";
const columns = [
    {
        title: "#", // Index column
        key: "index",
        render: (text, record, index) => index + 1, // Display the row index, starting from 1
    },
    {
        title: "Transaction Hash",
        dataIndex: "transactionHash",
        key: "transactionHash",
    },
    {
        title: "Event method",
        dataIndex: "method",
        key: "method",
        render: (method) => {
            // console.log("method: ", method);
            switch (method) {
                case "NFTMinted":
                    return <Tag color="geekblue">{method}</Tag>;
                case "Deposited":
                    return <Tag color="green">{method}</Tag>;
                case "Withdraw":
                    return <Tag color="red">{method}</Tag>;
                case "RewardClaimed":
                    return <Tag color="orange">{method}</Tag>;
                case "NFTDeposited":
                    return <Tag color="green">{method}</Tag>;
                case "NFTWithdrawn":
                    return <Tag color="red">{method}</Tag>;
                default:
                    return <Tag color="red">{method}</Tag>;
            }
        },
    },
    {
        title: "Block",
        dataIndex: "block",
        key: "block",
    },
    {
        title: "Event timestamp",
        dataIndex: "age",
        key: "age",
        render: (timestamp) => {
            const dateTime = new Date(parseInt(timestamp) * 1000);
            return dateTime.toLocaleString(); // This will show both date and time
        },
    },
    {
        title: "From",
        dataIndex: "from",
        key: "from",
    },
    {
        title: "To",
        dataIndex: "to",
        key: "to",
    },
    // {
    //     title: "User",
    //     dataIndex: "user",
    //     key: "user",
    // },
    {
        title: "Args",
        dataIndex: "args",
        key: "args",
        render: (args, record) => {
            const { method } = record;

            if (method.includes("NFT")) {
                // Treat the args as a string, remove leading zeros, and remove the decimal point
                let tokenId = args.toString().replace(/\./g, "").replace(/^0+/, ""); // Remove leading zeros and decimal point

                // If the tokenId becomes empty after stripping, it's 0
                if (tokenId === "") {
                    tokenId = "0";
                }

                return `Token Id: ${tokenId}`;
            } else {
                // For non-NFT methods, display 2 decimal places
                return `${parseFloat(args).toFixed(2)} TKA`;
            }
        },
    },
    {
        title: "Txn Fee",
        dataIndex: "txnFee",
        key: "txnFee",
        render: (txnFee) => {
            // Limit the transaction fee to 8 decimal places
            return `${parseFloat(txnFee).toFixed(8)} TKA`;
        },
    },
];

function History() {
    const [viewAdmin, setViewAdmin] = useState(false);
    const { address } = useWalletStore();
    const { filter, setFilter } = useFilter();
    const { paginationPage, setPaginationPage, setCurrentPage, setSizeChange } = usePaginationPage((state) => state);
    const { history, setHistory } = useHistory((state) => state);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!address) navigate("/");
    }, [address, navigate]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                let res;
                const isOwner = import.meta.env.VITE_OWNER;
                //  if current url has "/filter" in it then use get history filter
                if (isOwner && viewAdmin) {
                    if (window.location.pathname.includes("filter")) {
                        res = await historyService.adminGetHistoryFilter(
                            address,
                            filter,
                            paginationPage.currentPage,
                            paginationPage.perPage
                        );
                        if (res) {
                            // console.log("filter res: ", res);
                            setHistory(res.data);
                            setPaginationPage(res.meta);
                            setLoading(false);
                        }
                    } else {
                        res = await historyService.adminGetHistory(
                            address,
                            paginationPage.currentPage,
                            paginationPage.perPage
                        );
                        // console.log(res.data);
                        if (res) {
                            // console.log("res: ", res.meta);
                            setHistory(res.data);
                            setPaginationPage(res.meta);
                            setLoading(false);
                        }
                    }
                } else {
                    if (window.location.pathname.includes("filter")) {
                        res = await historyService.getHistoryFilter(
                            address,
                            filter,
                            paginationPage.currentPage,
                            paginationPage.perPage
                        );
                        if (res) {
                            // console.log("filter res: ", res);
                            setHistory(res.data);
                            setPaginationPage(res.meta);
                            setLoading(false);
                        }
                    } else {
                        res = await historyService.getUserHistory(
                            address,
                            paginationPage.currentPage,
                            paginationPage.perPage
                        );
                        // console.log(res.data);
                        if (res) {
                            // console.log("res: ", res.meta);
                            setHistory(res.data);
                            setPaginationPage(res.meta);
                            setLoading(false);
                        }
                    }
                }
            } catch (error) {
                console.log(error.message);
                toast.error(error.message);
            }
        };
        fetchData();
    }, [
        address,
        setPaginationPage,
        paginationPage.currentPage,
        paginationPage.perPage,
        setHistory,
        filter,
        setFilter,
        viewAdmin,
    ]);
    

    const handlePageChange = (value) => {
        setCurrentPage(value);
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: "instant" });
            navigate(`?page=${value}`);
        }, 0);
    };

    const handleSizeChange = (current, pageSize) => {
        setSizeChange(current, pageSize);
    };

    const handleSwitchViewAdmin = () => {
        setCurrentPage(1);
        setViewAdmin(!viewAdmin);
    };

    if (loading)
        return (
            // give me style for the comopnent that strect out to full monitor
            <Flex style={{ height: "100vh" }} align="center" gap="middle" justify="center">
                <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
            </Flex>
        );

    return (
        <Content style={{ padding: "0 48px", marginTop: "24px" }}>
            <h1>History</h1>
            <Flex gap="middle" align="center" justify="end" className="mb-3">
                {/* {address === import.meta.env.VITE_OWNER && ( */}
                {address === import.meta.env.VITE_OWNER && (
                    <>
                        <p>Currently viewing as admin</p>
                        <Switch checked={viewAdmin} onChange={handleSwitchViewAdmin} />
                    </>
                )}
                <Filter />
            </Flex>
            <Table
                columns={columns}
                dataSource={history}
                size="middle"
                scroll={{ x: "max-content" }}
                pagination={false}
            />
            <Pagination
                className="mt-3 d-flex justify-content-center"
                showSizeChanger
                current={paginationPage.currentPage}
                total={paginationPage.total}
                pageSize={paginationPage.perPage}
                onChange={handlePageChange}
                onShowSizeChange={(current, pageSize) => {
                    handleSizeChange(current, pageSize);
                }}
            />
        </Content>
    );
}

export default History;
