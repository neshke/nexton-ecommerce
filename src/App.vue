<script setup lang="ts">
import "./assets/main.css";
import Navbar from './components/Navbar.vue';
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
