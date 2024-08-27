// import { useState, useEffect } from "react";
import { Header as AntdHeader } from "antd/es/layout/layout";
import { Menu, Button, Dropdown, Flex } from "antd";
// import { ethers } from "ethers";
import { toast } from "react-toastify";
import useWalletStore from "../../store/useWalletStore";
import useContractBalanceStore from "../../store/useContractBalanceStore";
const items = [
    {
        key: "home",
        label: "Home",
        onClick: () => {
            console.log("Home");
        },
    },
    {
        key: "history",
        label: "Transaction history",
        onClick: () => {
            console.log("Transaction history");
        },
    },
    {
        key: "admin",
        label: "Admin",
        onClick: () => {
            console.log("Admin");
        },
    },
];

function Header() {
    const { provider, address, balance, login, logout } = useWalletStore();
    const { tokenA, tokenB } =
    useContractBalanceStore();
    // const handleLogin = async () => {
    //     try {
    //         if (!window.ethereum) {
    //             throw new Error("No MetaMask found");
    //         }

    //         const newProvider = new ethers.providers.Web3Provider(
    //             window.ethereum
    //         );
    //         setProvider(newProvider);

    //         await window.ethereum.request({
    //             method: "eth_requestAccounts",
    //         });

    //         const network = await newProvider.getNetwork();
    //         setNetWork(network);

    //         const newSigner = newProvider.getSigner();
    //         const newAddress = await newSigner.getAddress();
    //         setSigner(newSigner);
    //         setAddress(newAddress);

    //         // Fetch and set the balance
    //         const balanceInWei = await newProvider.getBalance(newAddress);
    //         const balanceInEth = ethers.utils.formatEther(balanceInWei);
    //         setBalance(balanceInEth);
    //         // console.log("provider:", newProvider);
    //         // console.log("network", network);
    //         // console.log("newSigner:", newSigner);
    //         // console.log("newAddress:", newAddress);
    //         // console.log("balanceInWei:", balanceInWei);
    //         // console.log("balanceInEth:", balanceInEth);
    //     } catch (error) {
    //         console.error(error);
    //         toast.error(error.message);
    //     }
    // };

    // const handleLogout = () => {
    //     setProvider(null);
    //     setSigner(null);
    //     setAddress(null);
    //     setNetWork(null);
    //     setBalance(null); // Clear balance on logout
    //     toast.info("Logged out successfully");
    // };
    // console.log(provider, address, balance);
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

    const menuItems = [
        {
            key: "1",
            label: <span onClick={handleChangeWallet}>Change Wallet</span>,
        },
        { key: "2", label: <span onClick={logout}>Logout</span> },
        { key: "3", label: <span>Your transaction history</span> },
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
            <h2 style={{ marginRight: "12px", color: "#4096ff" }}>
                Staking page
            </h2>
            <Menu
                mode="horizontal"
                defaultSelectedKeys={["2"]}
                items={items}
                style={{
                    flex: 1,
                    minWidth: 0,
                }}
            />
            {address ? (
                <>
                    <Flex gap={"small"} className="me-2">
                        <p
                            className="mx-2"
                            style={{ textAlign: "center", marginTop: "10px" }}
                        >
                            <span style={{ fontWeight: "bold" }}>Token A</span>:{""}
                            {tokenA ? `${tokenA} ETH` : "Loading..."}
                        </p>
                        <p
                            className="mx-2"
                            style={{ textAlign: "center", marginTop: "10px" }}
                        >
                            <span style={{ fontWeight: "bold" }}>Token B</span>:
                            {tokenB ? `${tokenB} Token` : "Loading..."}
                        </p>
                        <p
                            className="mx-2"
                            style={{ textAlign: "center", marginTop: "10px" }}
                        >
                            <span style={{ fontWeight: "bold" }}>Balance</span>:{" "}
                            {balance ? `${balance} ETH` : "Loading..."}
                        </p>
                    </Flex>
                    <Dropdown menu={{ items: menuItems }}>
                        <Button type="primary" style={{ marginLeft: "auto" }}>
                            {`Hello: ${address.substring(
                                0,
                                6
                            )}...${address.substring(address.length - 4)}`}
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
