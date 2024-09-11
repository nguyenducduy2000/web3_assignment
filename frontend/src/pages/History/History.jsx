import { Content } from "antd/es/layout/layout";
import { Table, Tag, Pagination, Flex, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { historyService } from "../../service/httpServices";
import { toast } from "react-toastify";
import useWalletStore from "../../store/useWalletStore";
import { usePaginationPage, useHistory, useFilter } from "../../store";
import { useNavigate } from "react-router-dom";
import Filter from "../../components/Filter/";
import { ethers } from "ethers";
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
        title: "Log Index",
        dataIndex: "logIndex",
        key: "logIndex",
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
        title: "Age",
        dataIndex: "age",
        key: "age",
        render: (timestamp) => {
            const dateTime = new Date(parseInt(timestamp) * 1000);
            return dateTime.toLocaleString(); // This will show both date and time
        },
    },
    {
        title: "User",
        dataIndex: "user",
        key: "user",
    },
    {
        title: "Args",
        dataIndex: "args",
        key: "args",
        // render: (data) => {
        //     console.log(data);
        //     return data.toString();
        // },
    },
    {
        title: "Txn Fee",
        dataIndex: "txnFee",
        key: "txnFee",
        // render: (data) => {
        //     console.log(data)
        //     return ethers.utils.parseUnits(data, 18);
        // }
    },
];

function History() {
    const { address } = useWalletStore();
    const { filter, setFilter } = useFilter();
    const { paginationPage, setPaginationPage, setCurrentPage, setSizeChange } = usePaginationPage((state) => state);
    const { history, setHistory } = useHistory((state) => state);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    // const [data, setData] = useState([]);
    useEffect(() => {
        if (!address) navigate("/");
    }, [address, navigate]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                let res;
                //  if current url has "/filter" in it then use get history filter
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
            } catch (error) {
                console.log(error.message);
                toast.error(error.message);
            }
        };
        fetchData();
    }, [address, setPaginationPage, paginationPage.currentPage, paginationPage.perPage, setHistory, filter, setFilter]);

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
            <Filter />
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
