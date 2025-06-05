<template>
  <div class="profile animate-fade-in">
    <header class="hero">
      <div class="hero-content">
        <h1 class="animate-slide-up">
          Moj <span class="highlight">Profil</span>
        </h1>
        <p class="hero-subtitle animate-slide-up" style="animation-delay: 0.2s">
          {{ welcomeMessage }}
        </p>
      </div>
    </header>

    <main class="profile-content animate-fade-in">
      <div class="profile-grid">
        <UserCard v-if="user" :user="user" class="animate-slide-up" style="animation-delay: 0.6s" />
        <AccountActions @logout="handleLogout" @change-password="handleChangePassword"
          @confirm-logout="handleConfirmLogout" @edit-profile="handleEditProfile" class="animate-slide-up"
          style="animation-delay: 0.8s" />
      </div>

      <!-- Dodata UserOrders komponenta -->
      <UserOrders class="animate-slide-up" style="animation-delay: 1s; margin-top: 2rem;" />
    </main> <!-- Edit Profile Modal -->
    <EditProfileModal v-model:show="isEditProfileModalVisible" :user="user"
      @close="isEditProfileModalVisible = false" /> <!-- Change Password Modal -->
    <ChangePasswordModal :isVisible="isChangePasswordModalVisible" @close="isChangePasswordModalVisible = false"
      @success="isChangePasswordModalVisible = false" />

    <!-- Logout Confirmation Modal -->
    <LogoutConfirmModal :isVisible="isLogoutConfirmModalVisible" @close="isLogoutConfirmModalVisible = false"
      @confirm="handleLogout" />
  </div>
</template>

<script lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useNotification } from '@/utils/notifications';
import UserCard from '@/components/profile/UserCard.vue';
import AccountActions from '@/components/profile/AccountActions.vue';
import UserOrders from '@/components/profile/UserOrders.vue';
import { useProfileStore } from '@/stores/profileStore';
import EditProfileModal from '@/components/profile/EditProfileModal.vue';
import ChangePasswordModal from '@/components/profile/ChangePasswordModal.vue';
import LogoutConfirmModal from '@/components/profile/LogoutConfirmModal.vue';

export default {
  name: "Profile", components: {
    UserCard,
    AccountActions,
    UserOrders,
    EditProfileModal,
    ChangePasswordModal,
    LogoutConfirmModal
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const profileStore = useProfileStore();
    const { showNotification } = useNotification();
    const isEditProfileModalVisible = ref(false); 
    const isChangePasswordModalVisible = ref(false);
    const isLogoutConfirmModalVisible = ref(false); 

    const user = computed(() => profileStore.user);

    onMounted(() => {
      if (authStore.isAuthenticated && !profileStore.profile) {
        profileStore.fetchUserProfile();
      }
    });

    // Generisanje prilagođene poruke dobrodošlice
    const welcomeMessage = computed(() => {
      if (!user.value?.name) return 'Dobrodošli na vašu profilnu tablu';
      const hour = new Date().getHours();

      if (hour < 12) return `Dobro jutro, ${user.value.name}!`;
      if (hour < 18) return `Dobar dan, ${user.value.name}!`;
      return `Dobro veče, ${user.value.name}!`;
    });

    // Funkcija za odjavu korisnika
    const handleLogout = async () => {
      await authStore.logout();
      showNotification('Uspešno ste se odjavili sa vašeg naloga.', 'success');
      router.push('/');
    };    // Funkcija za uređivanje profila
    const handleEditProfile = () => {
      isEditProfileModalVisible.value = true; // Show the modal
    };    // Funkcija za promenu lozinke
    const handleChangePassword = () => {
      isChangePasswordModalVisible.value = true; // Show the change password modal
    };

    // Funkcija za prikazivanje logout confirmation modal-a
    const handleConfirmLogout = () => {
      isLogoutConfirmModalVisible.value = true;
    };

    return {
      user,
      welcomeMessage,
      handleLogout,
      handleEditProfile,
      handleChangePassword,
      handleConfirmLogout,
      isEditProfileModalVisible, // Expose the modal visibility state
      isChangePasswordModalVisible, // Expose the change password modal visibility state
      isLogoutConfirmModalVisible // Expose the logout confirmation modal visibility state
    };
  }
}
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
