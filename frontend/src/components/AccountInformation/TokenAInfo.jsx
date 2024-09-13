import { Card, Flex, Divider, Button } from "antd";
import useWalletStore from "../../store/useWalletStore";
import {useContractBalanceStore} from "../../store";
import { useState } from "react";
import { toast } from "react-toastify";
import ActionButton from "../ActionButton/ActionButton";
// import { ethers } from "ethers";

function TokenAInfo() {
    const AMOUNT_2M_TKA = "2000000";
    const { signer, address } = useWalletStore();
    // const [amountA, setAmountA] = useState(null);
    const [depositA, setDepositA] = useState(null);
    const {
        totalSupply,
        tokenA,
        bonusAPR,
        transferTokensToUser,
        depositTokenA,
        withdraw,
        claimReward,
    } = useContractBalanceStore();

    function handleGetTokenA() {
        // if (amountA <= 0) {
        //     toast.error("Amount must be greater than 0");
        //     setAmountA(null);
        //     return;
        // }
        transferTokensToUser(signer, address, AMOUNT_2M_TKA);
    }
    function handleDepositTokenA() {
        if (parseFloat(depositA) > tokenA) {
            toast.error("Insufficient token A balance");
            setDepositA(null);
            return;
        }
        depositTokenA(signer, depositA);
    }
    function handleWithdraw() {
        if (confirm("Are you sure you want to withdraw?")) {
            withdraw(signer);
        }
    }
    function handleClaimReward() {
        claimReward(signer);
    }

    return (
        <Card wrap style={{ fontSize: "18px" }}>
            <Flex vertical gap={"small"}>
                <Divider>
                    <h4 style={{ fontWeight: "600" }}>Token A information</h4>
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
                    <span style={{ fontWeight: "bold" }}>Total supply</span>:{" "}
                    {parseFloat(totalSupply).toFixed(6)} TKA
                </div>
                <div
                    style={{
                        backgroundColor: "#c1c1c1",
                        borderRadius: "5px",
                        lineHeight: "40px",
                    }}
                    className="px-2"
                >
                    <span style={{ fontWeight: "bold" }}>Token A</span>:{" "}
                    {tokenA ? `${parseFloat(tokenA).toFixed(4)} ETH` : "Loading..."}
                </div>
                <div
                    style={{
                        backgroundColor: "#c1c1c1",
                        borderRadius: "5px",
                        lineHeight: "40px",
                    }}
                    className="px-2"
                >
                    <span style={{ fontWeight: "bold" }}>Your bonus APR</span>:{" "}
                    {bonusAPR || "Loading..."} %
                </div>
                <Flex className="mt-2" gap={"small"}>
                    {/* <ActionButton
                        title={"Faucet Token A"}
                        value={amountA}
                        setValue={setAmountA}
                        action={handleGetTokenA}
                        placeholder="Enter the amount you want to get"
                    /> */}
                    <Button type="primary" size="large" onClick={handleGetTokenA}>
                        Faucet 2M TKA
                    </Button>
                    <ActionButton
                        title="Deposit token A"
                        value={depositA}
                        setValue={setDepositA}
                        action={handleDepositTokenA}
                        placeholder="Enter the amount you want to deposit"
                    />
                    <Button
                        danger
                        type="primary"
                        onClick={handleClaimReward}
                        size="large"
                    >
                        Claim Reward
                    </Button>
                    <Button
                        danger
                        type="primary"
                        onClick={handleWithdraw}
                        size="large"
                    >
                        Withdraw
                    </Button>
                </Flex>
            </Flex>
        </Card>
    );
}

export default TokenAInfo;
