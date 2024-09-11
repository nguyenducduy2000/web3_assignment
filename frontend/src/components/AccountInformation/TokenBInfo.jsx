import { Card, Flex, Divider, Button, Select } from "antd";
import useWalletStore from "../../store/useWalletStore";
import useContractBalanceStore from "../../store/useContractBalanceStore";
import { useState } from "react";

function TokenBInfo() {
    const { signer, address } = useWalletStore();
    const [withdrawB, setWithdrawB] = useState(null);
    const [selectedTokenB, setSelectedTokenB] = useState(null);

    const {
        tokenB,
        ownedNFTs,
        depositTokenB,
        withdrawTokenB,
        depositedTokenB,
    } = useContractBalanceStore();

    const handleDepositTokenB = async () => {
        console.log(selectedTokenB);
        await depositTokenB(signer, selectedTokenB);
        setSelectedTokenB(null);
    };

    function handleWithdrawTokenB() {
        withdrawTokenB(signer, withdrawB);
    }
    return (
        <Card wrap style={{ fontSize: "18px" }}>
            <Flex vertical gap={"small"}>
                <Divider>
                    <h4>Token B information</h4>
                </Divider>
                <div
                    style={{
                        fontWeight: "bold",
                        backgroundColor: "#c1c1c1",
                        borderRadius: "5px",
                        lineHeight: "40px",
                    }}
                    className="px-2"
                >
                    Address: {address}
                </div>
                <div
                    style={{
                        backgroundColor: "#c1c1c1",
                        borderRadius: "5px",
                        lineHeight: "40px",
                    }}
                    className="px-2"
                >
                    <span style={{ fontWeight: "bold" }}>Token B</span>:{" "}
                    {tokenB ? `${tokenB} Token` : "Loading..."}
                </div>
                <Flex className="mt-2" gap={"small"} wrap>
                    <Flex justify="start" gap="middle" vertical>
                        <Flex gap={"small"} wrap>
                            <Select
                                showSearch
                                placeholder="Select Token Id to deposit"
                                optionFilterProp="label"
                                onChange={(e) => setSelectedTokenB(e)}
                                options={ownedNFTs.map((tokenId) => ({
                                    value: tokenId,
                                    label: tokenId,
                                }))}
                                value={selectedTokenB}
                                style={{ width: "60%" }}
                            />
                            <Button
                                type="primary"
                                onClick={handleDepositTokenB}
                            >
                                Deposit Token B
                            </Button>
                        </Flex>
                        <Flex gap={"small"} wrap>
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
                            <Button
                                type="primary"
                                onClick={handleWithdrawTokenB}
                            >
                                Withdraw Token B
                            </Button>
                        </Flex>
                    </Flex>
                </Flex>
            </Flex>
        </Card>
    );
}

export default TokenBInfo;
