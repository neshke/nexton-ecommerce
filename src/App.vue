<script setup lang="ts">
import "./assets/main.css";
import Navbar from "./components/Navbar.vue";
import { onMounted, onUnmounted } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useActivityTracker } from "@/services/activityTracker";
import { useProductStore } from "@/stores/productStore";

const authStore = useAuthStore();
const activityTracker = useActivityTracker();
const productStore = useProductStore();

onMounted(() => {
  authStore.initializeAuth();
  productStore.initializeStore();
  // Start tracking if user is already authenticated
  if (authStore.isAuthenticated()) {
    console.log("User is authenticated, starting activity tracking");
    activityTracker.startTracking();
  }
});

onUnmounted(() => {
  activityTracker.stopTracking();
});
</script>

<template>
  <div id="app">
    <Navbar />
    <router-view></router-view>
  </div>
</template>

<style>
#app {
  min-height: 100vh;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
