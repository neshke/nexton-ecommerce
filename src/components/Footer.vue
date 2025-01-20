<template>
  <footer class="footer">
    <p>&copy; {{ currentYear }} eCommerce Store. All rights reserved.</p>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>
.footer {
  margin-top: auto;
  padding: 2rem;
  background-color: #2d3748;
  color: white;
  text-align: center;
}
</style>
