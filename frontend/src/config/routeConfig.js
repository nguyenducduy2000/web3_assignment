import routes from "./routes";

import MainLayout from "../layout/MainLayout";

import Home from "../pages/Home";
import History from "../pages/History";
import Admin from "../pages/Admin";

const AppRoutes = [
    { path: routes.home, layout: MainLayout, component: Home },
    { path: routes.history, layout: MainLayout, component: History },
    { path: routes.filter, layout: MainLayout, component: History },
    { path: routes.admin, layout: MainLayout, component: Admin },
];

export default AppRoutes;
