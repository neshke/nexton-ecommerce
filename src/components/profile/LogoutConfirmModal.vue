<template>
  <Teleport to="#modal-container" v-if="isVisible">
    <div class="modal profile-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Potvrda odjave</h3>
          <button class="close-btn" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="warning-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <p class="confirmation-text">
            Da li ste sigurni da želite da se odjavite sa vašeg naloga?
          </p>
          <p class="sub-text">
            Biće potrebno da se ponovo prijavite da biste pristupili svom nalogu.
          </p>
        </div>

        <div class="modal-actions">
          <button class="btn secondary" @click="closeModal">
            Otkaži
          </button>
          <button class="btn danger" @click="confirmLogout">
            <i class="fas fa-sign-out-alt"></i>
            Odjavi se
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts">
export default {
  name: "LogoutConfirmModal",
  props: {
    isVisible: {
      type: Boolean,
      required: true
    }
  },
  emits: ['close', 'confirm'],
  setup(_props, { emit }) {
    const closeModal = () => {
      emit('close');
    }; const confirmLogout = () => {
      emit('confirm');
      emit('close');
    };

    return {
      closeModal,
      confirmLogout
    };
  }
};
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
  transform: scale(1);
  transition: all 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  border-radius: 16px 16px 0 0;
}

.modal-header h3 {
  margin: 0;
  color: #dc2626;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #dc2626;
  transition: all 0.2s;
  padding: 0.5rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2010;
}

.close-btn:hover {
  color: #991b1b;
  background: rgba(220, 38, 38, 0.1);
}

.modal-body {
  padding: 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.warning-icon {
  margin-bottom: 1.5rem;
}

.warning-icon i {
  font-size: 3rem;
  color: #f59e0b;
  animation: pulse 2s infinite;
}

.confirmation-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.75rem;
  line-height: 1.5;
}

.sub-text {
  color: #6b7280;
  font-size: 0.95rem;
  line-height: 1.4;
  margin: 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e5e7eb;
  background: #f8f9fa;
  border-radius: 0 0 16px 16px;
}

.btn {
  padding: 0.875rem 1.75rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
  justify-content: center;
}

.btn.secondary {
  background: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.btn.secondary:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

.btn.danger {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: white;
  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.25);
}

.btn.danger:hover {
  background: linear-gradient(135deg, #b91c1c, #991b1b);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(220, 38, 38, 0.3);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}

/* Animation for modal entrance */
@keyframes modalEnter {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-content {
  animation: modalEnter 0.3s ease-out;
}

/* Responsive */
@media (max-width: 640px) {
  .modal {
    padding: 0 !important;
    align-items: stretch !important;
    z-index: 2000 !important;
    /* Ensure it's above navbar on mobile */
  }

  .modal-content {
    width: 100% !important;
    height: 100vh !important;
    max-width: none !important;
    border-radius: 0 !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: center !important;
    /* Support for devices with notches/safe areas */
    padding-top: env(safe-area-inset-top) !important;
    padding-bottom: env(safe-area-inset-bottom) !important;
    margin: 0 !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
  }

  .modal-header,
  .modal-body,
  .modal-actions {
    padding: 1.5rem;
  }

  .modal-actions {
    flex-direction: column-reverse;
    gap: 0.75rem;
  }

  .btn {
    width: 100%;
    min-height: 44px;
    font-size: 1rem;
  }

  .close-btn {
    padding: 1rem;
    font-size: 1.75rem;
    min-width: 44px;
    min-height: 44px;
  }
}
</style>
