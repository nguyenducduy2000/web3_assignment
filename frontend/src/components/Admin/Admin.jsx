import { Card, Flex, Form, InputNumber, Button, Divider } from "antd";
import { useWalletStore, useContractBalanceStore } from "../../store";
import { useState } from "react";
function Admin() {
    const { signer, address } = useWalletStore();
    const { baseAPR, updateBaseAPR } = useContractBalanceStore();
    const [form] = Form.useForm();
    const [apr, setApr] = useState(parseInt(baseAPR));
    const onChange = (value) => {
        setApr(value);
    };

    const handleChangeAPR = () => {
        updateBaseAPR(signer, address, apr);
    };

    return (
        <Card wrap style={{ fontSize: "18px" }}>
            <Flex vertical>
                <Divider>
                    <h4 style={{ fontWeight: "600" }}>Admin Console</h4>
                </Divider>
                <Form form={form}>
                    <Flex gap={"small"} style={{ width: "100%" }}>
                        <Form.Item
                            name="baseAPR"
                            // rules={[{ message: "Please enter user name" }]}
                            // labelCol={{ span: 24 }}
                            // wrapperCol={{ span: 24 }}
                        >
                            <span style={{ fontSize: "16px" }}>Adjust Base APR: </span>{" "}
                            <InputNumber
                                size="middle"
                                min={0}
                                max={100}
                                defaultValue={baseAPR}
                                onChange={onChange}
                            />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" size="middle" onClick={handleChangeAPR}>
                                Save
                            </Button>
                        </Form.Item>
                    </Flex>
                </Form>
            </Flex>
        </Card>
    );
}

export default Admin;
