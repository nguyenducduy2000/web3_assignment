import { Flex, Drawer, Space, Button, Form, Input, Select, Slider } from "antd";
import { useEffect, useState } from "react";
import { useHistory, useWalletStore, useFilter, usePaginationPage } from "../../store";
import { useNavigate } from "react-router-dom";
// const options = [];
// for (let i = 10; i < 36; i++) {
//     options.push({
//         label: i.toString(36) + i,
//         value: i.toString(36) + i,
//     });
// }
function Filter() {
    const { address, latestBlock, getLatestBlock } = useWalletStore();
    const { setCurrentPage } = usePaginationPage();
    const { setFilter } = useFilter();
    const [open, setOpen] = useState(false);
    const { methods } = useHistory();
    const [form] = Form.useForm();
    const nagigate = useNavigate();
    const initBlock = parseInt(import.meta.env.VITE_INIT_BLOCK);
    // const options = Array.from(new Set(history.map((data) => data.method))).map((method) => ({
    //     value: method,
    //     label: method,
    // }));
    useEffect(() => {
        const fetchData = async () => {
            getLatestBlock();
        };
        fetchData();
    }, [getLatestBlock]);
    const options = methods.map((method) => ({
        key: method,
        value: method,
        label: method,
    }));
    const toggleDrawer = () => {
        setOpen(!open);
    };

    const handleChange = (value) => {
        console.log(`selected ${value}`);
    };

    const onFinish = (values) => {
        // Ensure the event field is an array
        const formData = {
            ...values,
            event: Array.isArray(values.event) ? values.event : [values.event],
        };

        // Log the form data
        // console.log("Form data:", formData);
        setFilter(formData);
        setCurrentPage(1);
        toggleDrawer();
        // navigate to /:address/filter?URLSearchParams
        nagigate(`/history/${address}/filter?${new URLSearchParams(formData).toString()}`);
    };

    return (
        <>
            <Flex justify="flex-end">
                <Space>
                    <button className="btn btn-primary" onClick={toggleDrawer}>
                        Filter
                    </button>
                </Space>
            </Flex>
            <Drawer
                open={open}
                placement="right"
                size="large"
                title="Filter"
                onClose={toggleDrawer}
                extra={
                    <Space>
                        <Button onClick={toggleDrawer}>Cancel</Button>
                        <Button
                            onClick={() => {
                                form.submit();
                            }}
                            type="primary"
                        >
                            Submit
                        </Button>
                    </Space>
                }
            >
                <Form form={form} onFinish={onFinish}>
                    <Form.Item
                        name="hash"
                        label="Transaction hash"
                        rules={[{ message: "Please enter user name" }]}
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                    >
                        <Input placeholder="Enter transaction hash" />
                    </Form.Item>
                    <Form.Item
                        name="event"
                        label="Event method"
                        // rules={[{ message: "Please enter user name" }]}
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                    >
                        <Select
                            mode="multiple"
                            allowClear
                            style={{ width: "100%" }}
                            placeholder="Please select event method"
                            onChange={handleChange}
                            options={options}
                        />
                    </Form.Item>
                    <Form.Item
                        name="block"
                        label="Block range:"
                        // rules={[{ message: "Please enter user name" }]}
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                    >
                        <Slider
                            range
                            min={initBlock}
                            max={latestBlock}
                            defaultValue={[initBlock, latestBlock]}
                            tooltip={{ placement: "bottom", autoAdjustOverflow: true }}
                        />
                    </Form.Item>
                </Form>
            </Drawer>
        </>
    );
}

export default Filter;
