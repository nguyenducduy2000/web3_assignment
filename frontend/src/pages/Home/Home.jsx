import { Content } from "antd/es/layout/layout";
import { Card, Flex, Space, Input, Select } from "antd";
import { Button } from "antd";
import { useEffect, useState } from "react";
import useWalletStore from "../../store/useWalletStore";
import useContractBalanceStore from "../../store/useContractBalanceStore";
import { toast } from "react-toastify";
function Home() {
    const [amountA, setAmountA] = useState(null);
    const [depositA, setDepositA] = useState(null);
    const [withdrawA, setWithdrawA] = useState(null);
    const [withdrawB, setWithdrawB] = useState(null);
    const [selectedTokenB, setSelectedTokenB] = useState(null);
    const { signer, address } = useWalletStore();
    const {
        totalSupply,
        tokenA,
        depositedTokenA,
        depositedTokenB,
        depositReward,
        APR,
        fetchBalances,
        ownedNFTs,
        transferTokensToUser,
        depositTokenA,
        withdrawTokenA,
        depositTokenB,
        withdrawTokenB,
        fetchOwnedNFTs,
        locktime,
    } = useContractBalanceStore();

    useEffect(() => {
        if (signer && address) {
            // Fetch balances when signer and address are available
            fetchBalances(signer, address);
            fetchOwnedNFTs(signer, address);
        }
    }, [signer, address, fetchBalances, fetchOwnedNFTs]);

    function handleGetTokenA() {
        if (amountA <= 0) {
            toast.error("Amount must be greater than 0");
            setAmountA(null);
            return;
        }
        transferTokensToUser(signer, address, amountA);
    }

    function handleDepositTokenA() {
        if (depositA > tokenA) {
            // console.log(tokenA);
            toast.error("Insufficient token A balance");
            setDepositA(null);
            return;
        }
        depositTokenA(signer, depositA);
    }

    function handleWithdrawTokenA() {
        if (withdrawA > depositedTokenA) {
            toast.error("Insufficient token A balance");
            setWithdrawA(null);
            return;
        }
        withdrawTokenA(signer, withdrawA);
    }

    function handleDepositTokenB() {
        console.log(selectedTokenB);
        depositTokenB(signer, selectedTokenB);
    }

    function handleWithdrawTokenB() {
        withdrawTokenB(signer, withdrawB);
    }

    return (
        <Content style={{ padding: "0 48px", marginTop: "24px" }}>
            <h1>Dashboard</h1>
            <p>Total supply: {totalSupply}</p>
            <Flex vertical gap="middle">
                <Card className="flex flex-fill" style={{ fontSize: "24px" }}>
                    <h2>Account: {address}</h2>
                    <p>
                        Your Token A deposit balance:{" "}
                        {depositedTokenA ? (`${depositedTokenA} TKA`) : "Loading..."}
                    </p>
                    <p>
                        Your token B deposit balance:{" "}
                        {depositedTokenB ? (`${depositedTokenB.length} TKB`) : "Loading..."}
                    </p>
                    <p>Your reward balance: {depositReward ? (`${depositReward} TKA`) : "Loading..."}</p>
                    <p>Current APR: {APR || "Loading..."}%</p>
                    <p>Deposit is locked until: {locktime}</p>
                </Card>
                <Flex justify="start" gap="middle" vertical>
                    <Space.Compact style={{ width: "50%" }}>
                        <Input
                            placeholder="Insert the amount you want to get"
                            value={amountA}
                            onChange={(e) => {
                                setAmountA(e.target.value);
                            }}
                        />
                        <Button type="primary" onClick={handleGetTokenA}>
                            Get Token A
                        </Button>
                    </Space.Compact>
                    <Space.Compact style={{ width: "50%" }}>
                        <Input
                            placeholder="Insert the amount you want to deposit"
                            value={depositA}
                            onChange={(e) => setDepositA(e.target.value)}
                        />
                        <Button type="primary" onClick={handleDepositTokenA}>
                            Deposit Token A
                        </Button>
                    </Space.Compact>
                    <Space.Compact style={{ width: "50%" }}>
                        <Input
                            placeholder="Insert the amount you want to withdraw"
                            value={withdrawA}
                            onChange={(e) => setWithdrawA(e.target.value)}
                        />
                        <Button type="primary" onClick={handleWithdrawTokenA}>
                            Withdraw
                        </Button>
                    </Space.Compact>
                    <Flex gap={"small"}>
                        <Select
                            showSearch
                            placeholder="Select Token Id to deposit"
                            optionFilterProp="label"
                            onChange={(e) => setSelectedTokenB(e)}
                            options={ownedNFTs.map((tokenId) => ({
                                value: tokenId,
                                label: tokenId,
                            }))}
                            style={{ width: "60%" }}
                        />
                        <Button type="primary" onClick={handleDepositTokenB}>
                            Deposit Token B
                        </Button>
                    </Flex>
                    <Flex gap={"small"}>
                        <Select
                            showSearch
                            placeholder="Select Token Id to withdraw"
                            optionFilterProp="label"
                            onChange={(e) => setWithdrawB(e)}
                            options={depositedTokenB.map((tokenId) => ({
                                value: tokenId,
                                label: tokenId,
                            }))}
                            style={{ width: "60%" }}
                        />
                        <Button type="primary" onClick={handleWithdrawTokenB}>Withdraw Token B</Button>
                    </Flex>
                    <Button danger>Claim Reward</Button>
                </Flex>
            </Flex>
        </Content>
    );
}

export default Home;
