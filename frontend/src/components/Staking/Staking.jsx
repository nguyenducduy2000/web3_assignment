import { Card, Flex, Divider } from "antd";
// import useWalletStore from "../../store/useWalletStore";
import { useContractBalanceStore } from "../../store";

function Staking() {
    const { depositedTokenA, depositedTokenB, calculatedReward, pendingReward, timestamp, locktime, nftTimestamp } =
        useContractBalanceStore();
    return (
        <Flex vertical gap="middle">
            <Card className="flex flex-fill">
                <h3 className="text-center">Staking information</h3>
                <Divider
                    style={{
                        borderColor: "#c1d1d1",
                    }}
                />
                <Flex vertical gap={"middle"}>
                    <Card
                        style={{
                            fontSize: "18px",
                            backgroundColor: "#dae1e9",
                        }}
                    >
                        <Divider
                            orientation="left"
                            style={{
                                borderColor: "#7cb305",
                            }}
                        >
                            <h3>Token A balance</h3>
                        </Divider>
                        <p>Your Token A deposit balance: {depositedTokenA ? `${depositedTokenA} TKA` : "Loading..."}</p>
                        <p>Your calculated reward: {calculatedReward ? `${calculatedReward} TKA` : "Loading..."}</p>
                        <p>Your pending reward: {pendingReward ? `${pendingReward} TKA` : "Loading..."}</p>
                        <p>
                            Last contract interaction:{" "}
                            {timestamp !== 0
                                ? `${new Date(timestamp * 1000).toLocaleString()}`
                                : "No transaction was made yet..."}
                        </p>
                        <p>
                            Contract locked timestamp:{" "}
                            {locktime !== 0
                                ? `${new Date(locktime * 1000).toLocaleString()}`
                                : "No transaction was made yet..."}
                        </p>
                    </Card>
                    <Card
                        style={{
                            fontSize: "18px",
                            backgroundColor: "#dae1e9",
                        }}
                    >
                        <Divider
                            orientation="left"
                            style={{
                                borderColor: "#7cb305",
                            }}
                        >
                            <h3>Token B balance</h3>
                        </Divider>
                        <p>
                            Your token B deposit balance:{" "}
                            {depositedTokenB ? `${depositedTokenB.length} TKB` : "Loading..."}
                        </p>
                        <p>
                            Token B deposit timestamp:{" "}
                            {nftTimestamp !== 0
                                ? `${new Date(nftTimestamp * 1000).toLocaleString()}`
                                : "No NFT deposited..."}
                        </p>
                    </Card>
                </Flex>
            </Card>
        </Flex>
    );
}

export default Staking;
