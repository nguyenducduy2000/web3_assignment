import React from "react";
import { Footer as AntdFooter } from "antd/es/layout/layout";

function Footer() {
    return (
        <AntdFooter style={{ textAlign: 'center' }}>
            <div className="w-100 position-absolute bottom-0 start-50 translate-middle-x text-black text-center">
                Copyright &copy; 2024. All rights reserved.
            </div>
        </AntdFooter>
    );
}

export default Footer;
