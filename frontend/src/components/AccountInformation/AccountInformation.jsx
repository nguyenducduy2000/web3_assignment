import { Tabs } from "antd";
import TokenAInfo from "./TokenAInfo";
import TokenBInfo from "./TokenBInfo";

function AccountInformation() {
    return (
        <Tabs
            centered
            type="card"
            size="middle"
            items={[
                {
                    key: "1",
                    label: "Token A",
                    children: <TokenAInfo />,
                },
                {
                    key: "2",
                    label: "Token B",
                    children: <TokenBInfo />,
                },
            ]}
        />
    );
}

export default AccountInformation;
