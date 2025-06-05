<template>
  <div class="card actions-card">
    <h3>Upravljanje nalogom</h3>
    <div class="action-list"> <button class="action-btn" @click="handleEditProfile">
        <i class="fas fa-user-edit"></i>
        <span>Izmeni Profil</span>
      </button> <button class="action-btn" @click="handleChangePassword">
        <i class="fas fa-key"></i>
        <span>Promeni lozinku</span>
      </button> <button class="action-btn danger" @click="handleConfirmLogout">
        <i class="fas fa-sign-out-alt"></i>
        <span>Odjavi se</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "AccountActions", emits: ['logout', 'change-password', 'confirm-logout', 'edit-profile'], setup(_props, { emit }) {
    const handleChangePassword = () => {
      emit('change-password');
    };

    const handleConfirmLogout = () => {
      emit('confirm-logout');
    };

    const handleEditProfile = () => {
      emit('edit-profile');
    };

    return {
      handleChangePassword,
      handleConfirmLogout,
      handleEditProfile
    };
  }
}
</script>

<style scoped>
@import "../../assets/styles/shared.css";

.action-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-btn.primary {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  box-shadow: 0 4px 6px rgba(99, 102, 241, 0.25);
}

.action-btn.primary:hover {
  background: linear-gradient(135deg, #4f46e5, #4338ca);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(99, 102, 241, 0.3);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 1rem;
  background: none;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  color: #2d3748;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn:hover {
  border-color: #6366f1;
  background: #f8f9fa;
  transform: translateX(10px);
}

.action-btn i {
  color: #2d3748;
  width: 24px;
  text-align: center;
}

.action-btn.danger {
  border-color: #dc2626;
  color: #dc2626;
  margin-top: 1rem;
}

.action-btn.danger i {
  color: #dc2626;
}

.action-btn.danger:hover {
  background: #fee2e2;
}

h3 {
  color: #2d3748;
  margin-bottom: 1.5rem;
}
</style>
