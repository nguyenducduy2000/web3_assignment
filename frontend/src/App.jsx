import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AppRoutes } from './config';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
    return (
        <>
            <ToastContainer
                position="bottom-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            <Router>
                <Routes>
                    {AppRoutes.map((route, index) => {
                        const Page = route.component;
                        const AppLayout = route.layout;
                        return (
                            <Route
                                key={index}
                                path={route.path}
                                element={
                                    <AppLayout>
                                        <Page />
                                    </AppLayout>
                                }
                            />
                        );
                    })}
                </Routes>
            </Router>
        </>
    );
}

export default App;
