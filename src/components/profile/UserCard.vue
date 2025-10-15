<template>
  <div class="user-card">
    <div v-if="displayUser" class="user-details">
      <div class="user-avatar">
        <span>{{ displayUser.name ? displayUser.name.charAt(0).toUpperCase() : '#' }}</span>
      </div>
      <div class="user-info">
        <h3>{{ displayUser.name || 'Korisnik' }}</h3>
        <p>{{ displayUser.email }}</p>
        <p class="user-role" v-if="displayUser.role">Uloga: {{ displayUser.role }}</p>
      </div>
    </div>
    <div v-else class="user-info">
      <p>Podaci o korisniku nisu dostupni.</p>
    </div>

    <div class="user-actions">
    </div>

    <div v-if="authStore.isAdmin" class="admin-actions">
      <button @click="goToAdminOrders" class="btn btn-admin">
        Pregled Svih Porudžbina (Admin)
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useProfileStore } from '@/stores/profileStore';
import type { User } from '@/models/auth';
import { computed } from 'vue';

const props = defineProps<{
  user: User | null;
}>();

const authStore = useAuthStore();
const profileStore = useProfileStore();
const router = useRouter();

// Use the latest user data from profileStore if available
const displayUser = computed(() => {
  return profileStore.user || props.user;
});

const goToAdminOrders = () => {
  router.push({ name: 'AdminOrders' });
};
</script>

<style scoped>
.user-card {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 250px;
  /* Dodao minimalnu visinu radi konzistentnosti */
}

.user-details {
  margin-bottom: 1.5rem;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #6366f1;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  margin: 0 auto 1rem;
  border: 3px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-info h3 {
  margin: 0.5rem 0 0.25rem;
  font-size: 1.4em;
  color: #333;
}

.user-info p {
  margin: 0.25rem 0;
  color: #666;
  font-size: 0.95em;
}

.user-role {
  font-style: italic;
  color: #555;
  font-size: 0.9em;
  margin-top: 0.3rem;
}

.user-actions {
  margin-top: 1rem;
}

.admin-actions {
  margin-top: auto;
  /* Gura admin dugme na dno ako ima prostora */
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.btn-admin {
  width: 100%;
  padding: 0.8rem 1rem;
  background-color: #4a5568;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1em;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, transform 0.1s ease;
  text-align: center;
}

.btn-admin:hover {
  background-color: #2d3748;
  transform: translateY(-1px);
}

.btn-admin:active {
  transform: translateY(0px);
}
</style>
