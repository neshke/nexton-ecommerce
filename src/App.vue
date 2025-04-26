<script lang="ts">
import "./assets/main.css";
import Navbar from "./components/Navbar.vue";
import { onBeforeMount, onUnmounted, defineComponent } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useActivityTracker } from "@/services/activityTracker";
import { useProductStore } from "@/stores/productStore";
import { useCartStore } from "@/stores/cartStore";
import { useNotification } from "@/utils/notifications";

export default defineComponent({
  name: "App",
  components: {
    Navbar
  },
  setup() {
    const authStore = useAuthStore();
    const activityTracker = useActivityTracker();
    const productStore = useProductStore();
    const cartStore = useCartStore();

    const { notification, showNotification } = useNotification();

    // Izvršava se pre montiranja komponente.
    onBeforeMount(() => {
      // Inicijalizuje stanje autentifikacije.
      authStore.initializeAuth();
      // Inicijalizuje stanje prodavnice proizvoda.
      productStore.initializeStore();
      // Inicijalizuje korpu iz lokalnog skladišta.
      cartStore.initializeCart(); // Initialize cart from localStorage
      // Pokreće praćenje aktivnosti ako je korisnik autentifikovan.
      if (authStore.isAuthenticated) {
        console.log("User is authenticated, starting activity tracking");
        activityTracker.startTracking();
      }
    });

    // Izvršava se pre demontiranja komponente.
    onUnmounted(() => {
      // Zaustavlja praćenje aktivnosti.
      activityTracker.stopTracking();
    });

    return {
      notification,
      showNotification,
    };
  }
});
</script>

<template>
  <div id="app">
    <Navbar />
    <router-view></router-view>
    <div v-if="notification" :class="['notification', `notification-${notification.type}`]">
      {{ notification.message }}
    </div>
  </div>
</template>

<style>
#app {
  min-height: 100vh;
  font-family: 'Rubik', 'LeckerliOne', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  position: relative;
}

.notification {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 20px;
  border-radius: 4px;
  color: white;
  font-weight: 500;
  z-index: 1000;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
  animation: fadeIn 0.3s ease-out;
  min-width: 250px;
  text-align: center;
}

.notification-success {
  background-color: #4caf50;
}

.notification-error {
  background-color: #f44336;
}

.notification-info {
  background-color: #2196f3;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, 10px);
  }

  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}
</style>
