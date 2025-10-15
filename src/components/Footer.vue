<template>
  <footer class="footer">
    <p>&copy; {{ currentYear }} eCommerce Prodavnica. Sva prava zadržana.</p>
  </footer>
</template>

<script lang="ts">
import { computed } from 'vue';

export default {
  name: "Footer",
  setup() {
    const currentYear = computed(() => new Date().getFullYear());

    return {
      currentYear
    }
  }
}
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
