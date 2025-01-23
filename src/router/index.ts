import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import Home from "../pages/Home.vue";
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import Profile from '../components/Profile.vue';

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/products",
    name: "Products",
    component: () => import("../pages/Products.vue"),
  },
  {
    path: "/product/:id",
    name: "ProductDetail",
    component: () => import("../components/Products/ProductDetail.vue"),
  },
  {
    path: "/cart",
    name: "Cart",
    component: () => import("../components/Cart.vue"),
  },
  {
    path: "/checkout",
    name: "Checkout",
    component: () => import("../pages/Checkout.vue"),
  },
  {
    path: "/about",
    name: "About",
    component: () => import("../pages/About.vue"),
  },
  {
    path: "/contact",
    name: "Contact",
    component: () => import("../pages/Contact.vue"),
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
  },
  {
    path: "/register",
    name: "register",
    component: RegisterView,
  },
  {
    path: "/profile",
    name: "profile",
    component: Profile,
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
