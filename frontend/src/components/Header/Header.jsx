import { useNavigate } from "react-router-dom";
import { Header as AntdHeader } from "antd/es/layout/layout";
import { Menu, Button, Dropdown, Flex } from "antd";
// import { ethers } from "ethers";
import { toast } from "react-toastify";
import { useWalletStore, useContractBalanceStore } from "../../store";
import { useEffect } from "react";
// import useContractBalanceStore from "../../store/useContractBalanceStore";
function Header() {
    const navigate = useNavigate();
    const { provider, address, balance, login, logout, getBalance } = useWalletStore();
    const {
        baseAPR,
        totalSupply,
        tokenA,
        tokenB,
        depositedTokenA,
        depositedTokenB,
        stakingBalance,
        bonusAPR,
        depositCounter,
        calculatedReward,
        pendingReward,
        depositTimestamp,
        ownedNFTs,
        timestamp,
        locktime,
        nftTimestamp,
    } = useContractBalanceStore();

    useEffect(() => {
        const fetchWallatBalance = async () => {
            try {
                getBalance();
            } catch (error) {
                console.error(error);
                toast.error(error.message);
            }
        };
        fetchWallatBalance();
    }, [
        provider,
        address,
        getBalance,
        totalSupply,
        tokenA,
        tokenB,
        depositedTokenA,
        depositedTokenB,
        stakingBalance,
        baseAPR,
        bonusAPR,
        depositCounter,
        calculatedReward,
        pendingReward,
        depositTimestamp,
        ownedNFTs,
        timestamp,
        locktime,
        nftTimestamp,
    ]);

    const handleChangeWallet = async () => {
        try {
            if (!provider) {
                throw new Error("No MetaMask found");
            }

            await window.ethereum.request({
                method: "wallet_requestPermissions",
                params: [
                    {
                        eth_accounts: {},
                    },
                ],
            });

            login(); // Re-login after switching accounts
        } catch (error) {
            console.error(error);
            toast.error("Failed to switch wallet");
        }
    };

    const items = [
        {
            key: "home",
            label: "Home",
            onClick: () => {
                navigate("/");
            },
        },
        {
            key: "history",
            label: "Transaction history",
            onClick: () => {
                if (address === null) {
                    toast.error("Please connect your wallet");
                } else {
                    navigate(`/history/${address}`);
                }
            },
        },
        // {
        //     key: "admin",
        //     label: "Admin",

        //     onClick: () => {
        //         navigate("/admin");
        //     },
        // },
    ];

    const menuItems = [
        {
            key: "1",
            label: <span onClick={handleChangeWallet}>Change Wallet</span>,
        },
        { key: "2", label: <span onClick={logout}>Logout</span> },
        {
            key: "3",
            label: <span>Your transaction history</span>,
            onClick: () => {
                navigate("/history");
            },
        },
    ];

    return (
        <AntdHeader
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "white",
                fontSize: "16px",
            }}
        >
            <h2 style={{ marginRight: "12px", color: "#4096ff" }}>Staking page</h2>
            <Menu
                mode="horizontal"
                defaultSelectedKeys={["home"]}
                items={items}
                style={{
                    flex: 1,
                    minWidth: 0,
                }}
            />
            {address ? (
                <>
                    <Flex gap={"small"} className="me-2">
                        <p className="mx-2" style={{ textAlign: "center", marginTop: "10px" }}>
                            <span style={{ fontWeight: "bold" }}>BASE APR:</span>{" "}
                            {baseAPR ? `${baseAPR} %` : "Loading..."}
                        </p>
                        <p className="mx-2" style={{ textAlign: "center", marginTop: "10px" }}>
                            <span style={{ fontWeight: "bold" }}>Balance</span>:{" "}
                            {balance ? `${balance} ETH` : "Loading..."}
                        </p>
                    </Flex>
                    <Dropdown menu={{ items: menuItems }}>
                        <Button type="primary" style={{ marginLeft: "auto" }}>
                            {`Hello: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`}
                        </Button>
                    </Dropdown>
                </>
            ) : (
                <Button type="primary" onClick={login}>
                    Connect MetaMask wallet
                </Button>
            )}
        </AntdHeader>
    );
}

export default Header;
