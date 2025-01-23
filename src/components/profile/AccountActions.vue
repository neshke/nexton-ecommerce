<template>
  <div class="card">
    <h2>Account Settings</h2>
    <div class="actions">
      <button v-for="action in actions" 
              :key="action.label"
              class="action-btn"
              :class="{ logout: action.type === 'logout' }"
              @click="action.onClick">
        <i :class="action.icon"></i>
        {{ action.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{ (e: 'logout'): void }>();

const actions = [
  { label: 'Edit Profile', icon: 'fas fa-user-edit' },
  { label: 'Change Password', icon: 'fas fa-key' },
  { label: 'Notifications', icon: 'fas fa-bell' },
  { 
    label: 'Logout', 
    icon: 'fas fa-sign-out-alt', 
    type: 'logout',
    onClick: () => emit('logout')
  }
];
</script>

<style scoped>
@import "../../assets/styles/shared.css";

.actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
  color: #6366f1;
  width: 24px;
  text-align: center;
}

.action-btn.logout {
  border-color: #dc2626;
  color: #dc2626;
  margin-top: 1rem;
}

.action-btn.logout i {
  color: #dc2626;
}

.action-btn.logout:hover {
  background: #fee2e2;
}

h2 {
  color: #2d3748;
  margin-bottom: 1.5rem;
}
</style>
