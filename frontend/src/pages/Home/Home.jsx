import { Content } from "antd/es/layout/layout";
import { Col, Flex, Row, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useWalletStore, useContractBalanceStore } from "../../store";
import { AccountInformation } from "../../components/AccountInformation";
import Staking from "../../components/Staking/Staking";
import Admin from "../../components/Admin";
import { toast } from "react-toastify";
function Home() {
    const [loading, setLoading] = useState(false);
    const owner = import.meta.env.VITE_OWNER;
    const { signer, address, network, getBalance } = useWalletStore();
    const {
        fetchBalances,
        fetchOwnedNFTs,
        // transferTokensToUser,
        // depositTokenA,
        // withdraw,
        // depositTokenB,
        // withdrawTokenB,
        // claimReward,
        // updateBaseAPR,
    } = useContractBalanceStore();

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (network?.chainId === 97 && signer && address) {
                    // Fetch balances when signer and address are available
                    setLoading(true);
                    await fetchBalances(signer, address);
                    await getBalance();
                    setLoading(false);
                }
            } catch (error) {
                console.error(error.message);
                toast.error(error.message);
            }
        };
        fetchData();
    }, [signer, address, network, fetchBalances, fetchOwnedNFTs, getBalance]);

    if (!signer) {
        return (
            <div>
                <h1 className="text-center">Please connect your wallet</h1>
            </div>
        );
    }

    if (network.chainId !== 97) {
        return (
            <div>
                <h1 className="text-center">Please switch back to the correct network</h1>
            </div>
        );
    }

    if (loading)
        return (
            // give me style for the comopnent that strect out to full monitor
            <Flex style={{ height: "100vh" }} align="center" gap="middle" justify="center">
                <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
            </Flex>
        );

    return (
        <Content style={{ padding: "0 48px", marginTop: "24px" }}>
            <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                <Col span={16}>
                    <Staking />
                </Col>
                <Col span={8}>
                    <Flex vertical gap={"small"}>
                        <AccountInformation />
                        {address === owner && <Admin />}
                    </Flex>
                </Col>
            </Row>
        </Content>
    );
}

export default Home;
