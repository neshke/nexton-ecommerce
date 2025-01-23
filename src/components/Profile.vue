<template>
  <div class="profile animate-fade-in">
    <header class="hero">
      <div class="hero-content">
        <h1 class="animate-slide-up">
          My <span class="highlight">Profile</span>
        </h1>
        <p class="hero-subtitle animate-slide-up" style="animation-delay: 0.2s">
          {{ welcomeMessage }}
        </p>
        <div class="hero-buttons animate-slide-up" style="animation-delay: 0.4s">
          <button class="hero-btn primary" @click="handleEditProfile">
            Edit Profile
          </button>
          <button class="hero-btn secondary" @click="handleSettings">
            Settings
          </button>
        </div>
      </div>
    </header>

    <main class="profile-content animate-fade-in">
      <div class="profile-grid">
        <UserCard :user="user" class="animate-slide-up" style="animation-delay: 0.6s" />
        <AccountActions @logout="handleLogout" class="animate-slide-up" style="animation-delay: 0.8s" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "vue-router";
import { computed, onMounted } from "vue";
import UserCard from "./profile/UserCard.vue";
import AccountActions from "./profile/AccountActions.vue";

const authStore = useAuthStore();
const router = useRouter();
const user = computed(() => authStore.user);

const welcomeMessage = computed(() => 
  user.value?.username 
    ? `Welcome back, ${user.value.username}!` 
    : 'Manage your account and preferences'
);

const handleLogout = () => {
  authStore.logout();
  router.push("/login");
};

const handleEditProfile = () => {
  // Implement edit profile logic
};

const handleSettings = () => {
  // Implement settings logic
};

onMounted(() => {
  if (!authStore.isAuthenticated()) {
    router.push("/login");
  }
});
</script>

<style scoped>
@import "../assets/styles/shared.css";

.profile {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.hero-content {
  max-width: min(800px, 90%);
  margin: 0 auto;
}

.hero-subtitle {
  font-size: clamp(1rem, 3vw, 1.4rem);
  opacity: 0.9;
  margin-bottom: 2rem;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.hero-btn {
  padding: 1rem 2.5rem;
  font-size: clamp(0.9rem, 2vw, 1.1rem);
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  min-width: 160px;
}

.hero-btn.primary {
  background-color: white;
  color: #6366f1;
}

.hero-btn.secondary {
  background-color: transparent;
  border: 2px solid white;
  color: white;
}

.hero-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.profile-content {
  padding: 4rem 2rem;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .hero-buttons {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .hero-btn {
    width: 100%;
    max-width: 300px;
  }

  .profile-content {
    padding: 2rem 1rem;
  }

  .profile-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slideUp 0.8s ease-out forwards;
}
</style>
