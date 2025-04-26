<template>
  <div class="profile-container">
    <button class="auth-button" @click="toggleMenu">
      <i class="fas fa-user-circle"></i>
      {{ username }}
    </button>

    <div v-if="isOpen" class="dropdown">
      <div class="dropdown-header">
        <span class="avatar">{{ username.charAt(0).toUpperCase() }}</span>
        <span>{{ username }}</span>
      </div>

      <nav class="dropdown-menu">
        <router-link to="/profile" class="menu-item" @click="closeMenu">
          <i class="fas fa-user"></i> Profil
        </router-link>
        <button class="menu-item logout" @click="handleLogout">
          <i class="fas fa-sign-out-alt"></i> Odjava
        </button>
      </nav>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";

export default {
  name: 'ProfileDropdown',

  props: {
    username: {
      type: String,
      required: true
    }
  },

  emits: ['close'],

  setup(_props, { emit }) {
    const router = useRouter();
    const authStore = useAuthStore();
    const isOpen = ref(false);

    // Funkcija za otvaranje/zatvaranje menija.
    const toggleMenu = () => {
      isOpen.value = !isOpen.value;
    };

    // Funkcija za zatvaranje menija.
    const closeMenu = () => {
      isOpen.value = false;
      emit('close');
    };

    // Funkcija za odjavu korisnika.
    const handleLogout = async () => {
      await authStore.logout();
      closeMenu();
      router.push('/');
    };

    // Rukovanje klikom van komponente da bi se zatvorila.
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest('.profile-container')) {
        closeMenu();
      }
    };

    // Lifecycle hooks
    // Dodaje osluškivač događaja za klik van komponente kada se komponenta montira.
    onMounted(() => document.addEventListener('click', handleClickOutside));
    // Uklanja osluškivač događaja kada se komponenta demontira.
    onUnmounted(() => document.removeEventListener('click', handleClickOutside));

    return {
      isOpen, // Stanje menija (otvoren/zatvoren)
      toggleMenu, // Funkcija za otvaranje/zatvaranje
      closeMenu, // Funkcija za zatvaranje
      handleLogout // Funkcija za odjavu
    };
  }
};
</script>

<style scoped>
@import "../assets/styles/shared.css";

.profile-container {
  position: relative;
}

.dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 240px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  animation: dropIn 0.2s ease-out;
  border: 1px solid #e5e7eb;
}

.dropdown-header {
  padding: 1.25rem;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-weight: 600;
}

.avatar {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: white;
  display: grid;
  place-items: center;
  color: #6366f1;
  font-weight: bold;
  font-size: 1.2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem 1.25rem;
  border: none;
  background: none;
  text-decoration: none;
  color: #4b5563;
  transition: all 0.2s ease;
  font-weight: 500;
}

.menu-item:hover {
  background: #f3f4f6;
  color: #6366f1;
  padding-left: 1.5rem;
}

.menu-item.logout {
  color: #dc2626;
  border-top: 1px solid #e5e7eb;
  font-weight: 600;
}

.menu-item.logout:hover {
  background: #fee2e2;
  color: #dc2626;
}

@keyframes dropIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .dropdown {
    position: static;
    box-shadow: none;
    animation: none;
  }

  .menu-item {
    padding: 1rem 1.5rem;
  }

  .menu-item:hover {
    padding-left: 2rem;
  }
}
</style>
