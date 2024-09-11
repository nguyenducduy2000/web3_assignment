import { Card, Flex, Form, InputNumber, Button } from "antd";

function Admin() {
    const [form] = Form.useForm();
    const onChange = (value) => {
        console.log("changed", value);
    };
    return (
        <Card title="Admin console">
            <Form form={form}>
                <Form.Item
                    name="baseAPR"
                    label="Adjust Base APR"
                    // rules={[{ message: "Please enter user name" }]}
                    // labelCol={{ span: 24 }}
                    // wrapperCol={{ span: 24 }}
                >
                    <Flex gap={"small"} >
                        <InputNumber size="large" max={100000} defaultValue={3} onChange={onChange} />
                        <Button size="large" type="primary">Save</Button>
                    </Flex>
                </Form.Item>
            </Form>
        </Card>
    );
}

export default Admin;
