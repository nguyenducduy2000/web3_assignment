import Header from "../components/Header";
import Footer from "../Components/Footer";
import { Layout } from "antd";

function MainLayout({ children }) {
    return (
        <Layout className="d-flex flex-fill flex-column">
            <Header />
            <div className="wrapper">{children}</div>
            <Footer />
        </Layout>
    );
}

export default MainLayout;
