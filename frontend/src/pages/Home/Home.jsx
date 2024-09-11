import { Content } from "antd/es/layout/layout";
import { Col, Flex, Row } from "antd";
import { useEffect } from "react";
import { useWalletStore, useContractBalanceStore } from "../../store";
import { AccountInformation } from "../../components/AccountInformation";
import Staking from "../../components/Staking/Staking";
import { Admin } from "../../components/Admin";
function Home() {
    const owner = import.meta.env.VITE_OWNER;
    const { signer, address, network } = useWalletStore();
    const {
        fetchBalances,
        fetchOwnedNFTs,
        transferTokensToUser,
        depositTokenA,
        withdraw,
        depositTokenB,
        withdrawTokenB,
        claimReward,
    } = useContractBalanceStore();

    useEffect(() => {
        if (signer && address) {
            // Fetch balances when signer and address are available
            fetchBalances(signer, address);
            // fetchOwnedNFTs(signer, address);
        }
    }, [
        signer,
        address,
        network,
        fetchBalances,
        fetchOwnedNFTs,
        transferTokensToUser,
        depositTokenA,
        withdraw,
        depositTokenB,
        withdrawTokenB,
        claimReward,
    ]);

    if (!signer) {
        return (
            <div>
                <h1 className="text-center">Please connect your wallet</h1>
            </div>
        );
    }

    if (network.chainId !== 31337 && network.chainId !== 97) {
        return (
            <div>
                <h1 className="text-center">Please switch back to the correct network</h1>
            </div>
        );
    }

    return (
        <Content style={{ padding: "0 48px", marginTop: "24px" }}>
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col span={16}>
                    <Staking />
                </Col>
                <Col span={8}>
                    <Flex vertical gap={"small"}>
                        <AccountInformation />
                        {console.log(owner)}
                        {address === `0x${owner}` ? <Admin /> : <div>Is not admin</div>}
                    </Flex>
                </Col>
            </Row>
        </Content>
    );
}

export default Home;
