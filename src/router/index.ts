import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import Home from "../pages/Home.vue";
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import Profile from '../components/Profile.vue';
import Cart from '@/pages/Cart.vue';
import { useAuthStore } from '@/stores/authStore';
import AdminOrders from '@/pages/admin/AdminOrders.vue';

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
    component: Cart,
    meta: {
      requiresAuth: false,
      title: 'Shopping Cart'
    }
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
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/orders',
    name: 'AdminOrders',
    component: AdminOrders,
    meta: { requiresAuth: true, requiresAdmin: true }
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

// Add navigation guards
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();

  // Provera da li ruta zahteva autentifikaciju
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login'); // Preusmeri na login ako nije autentifikovan
  }
  // Provera da li ruta zahteva admin prava
  else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    // Možeš preusmeriti na neku 'zabranjeno' stranicu ili na početnu
    console.warn('Pokušaj pristupa admin ruti od strane ne-administratora.');
    next('/'); // Preusmeri na početnu stranicu
  }
  // Originalna provera za /profile, sada pokrivena sa to.meta.requiresAuth
  // if (to.path === '/profile' && !authStore.isAuthenticated) {
  //   next('/login');
  // } 
  else {
    next(); // Dozvoli navigaciju
  }
});

export default router;
