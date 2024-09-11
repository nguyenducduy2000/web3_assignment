/* eslint-disable react/prop-types */
import { Dropdown, Flex, Input, Button, Space } from "antd";

function ActionButton({
    title,
    value,
    setValue,
    action,
    placeholder,
    type = "primary",
    size = "large",
}) {
    return (
        <Space>
            <Dropdown
                dropdownRender={() => (
                    <div
                        className="bg-dark"
                        style={{
                            // backgroundColor: "#2a2a2e",
                            borderRadius: "5px",
                            width: "360px",
                            padding: "10px",
                        }}
                    >
                        <Flex gap={"small"}>
                            <Input
                                placeholder={placeholder}
                                value={value}
                                onChange={(e) => {
                                    setValue(e.target.value);
                                }}
                            />
                            <Button type="primary" onClick={action}>
                                Submit
                            </Button>
                        </Flex>
                    </div>
                )}
                arrow
                trigger={["click"]}
                placement="bottomLeft"
            >
                <Button type={type} size={size}>
                    {title}
                </Button>
            </Dropdown>
        </Space>
    );
}

export default ActionButton;
