import routes from "./routes";

import MainLayout from "../layout/MainLayout";

import Home from "../pages/Home";

const AppRoutes = [
    { path: routes.home, layout: MainLayout, component: Home },
    // { path: routes.login, layout: LoginForm, component: Login },
    // { path: routes.register, layout: LoginForm, component: Login },
    // { path: routes.cart, layout: MainLayout, component: Cart },
    // { path: routes.bookView, layout: MainLayout, component: BookView },
    // { path: routes.genres, layout: MainLayout, component: Genre },
    // { path: routes.latest, layout: MainLayout, component: Genre },
    // { path: routes.checkout, layout: MainLayout, component: Checkout },
    // { path: routes.account, layout: UserLayout, component: UserInfo },
    // { path: routes.transactions, layout: UserLayout, component: Transaction },
    // { path: routes.favorites, layout: UserLayout, component: Favorites },
];

export default AppRoutes;
