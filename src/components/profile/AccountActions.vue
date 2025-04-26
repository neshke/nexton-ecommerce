<template>
  <div class="card actions-card">
    <h3>Upravljanje nalogom</h3>
    <div class="action-list">
      <button class="action-btn">
        <i class="fas fa-key"></i>
        <span>Promeni lozinku</span>
      </button>
      <button class="action-btn">
        <i class="fas fa-bell"></i>
        <span>Podešavanja obaveštenja</span>
      </button>
      <button class="action-btn">
        <i class="fas fa-cog"></i>
        <span>Podešavanja naloga</span>
      </button>
      <button class="action-btn danger" @click="confirmLogout">
        <i class="fas fa-sign-out-alt"></i>
        <span>Odjavi se</span>
      </button>
    </div>

    <!-- Dijalog za potvrdu odjave -->
    <div class="modal" v-if="showLogoutConfirm">
      <div class="modal-content">
        <h3>Potvrda odjave</h3>
        <p>Da li ste sigurni da želite da se odjavite?</p>
        <div class="modal-actions">
          <button class="modal-btn cancel" @click="showLogoutConfirm = false">Otkaži</button>
          <button class="modal-btn confirm" @click="handleLogout">Potvrdi</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue';

export default {
  name: "AccountActions",
  emits: ['logout'],
  setup(_props, { emit }) {
    const showLogoutConfirm = ref(false);

    // Funkcija za prikazivanje dijaloga za potvrdu odjave
    const confirmLogout = () => {
      showLogoutConfirm.value = true;
    };

    // Funkcija za potvrdu odjave
    const handleLogout = () => {
      emit('logout');
      showLogoutConfirm.value = false;
    };

    return {
      showLogoutConfirm,
      confirmLogout,
      handleLogout
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

/* Modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.modal-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-btn.cancel {
  background: #f3f4f6;
  color: #4b5563;
  border: none;
}

.modal-btn.confirm {
  background: #dc2626;
  color: white;
  border: none;
}

.modal-btn:hover {
  transform: translateY(-2px);
}
</style>
