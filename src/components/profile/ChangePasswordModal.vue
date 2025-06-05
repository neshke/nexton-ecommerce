<template>
  <Teleport to="#modal-container" v-if="isVisible">
    <div class="modal profile-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Promeni lozinku</h3>
          <button class="close-btn" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label for="currentPassword">Trenutna lozinka</label>
              <div class="password-input">
                <input :type="showCurrentPassword ? 'text' : 'password'" id="currentPassword"
                  v-model="form.currentPassword" :class="{ 'error': errors.currentPassword }"
                  placeholder="Unesite trenutnu lozinku" required />
                <button type="button" class="toggle-password" @click="showCurrentPassword = !showCurrentPassword">
                  <i :class="showCurrentPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <span v-if="errors.currentPassword" class="error-message">{{ errors.currentPassword }}</span>
            </div>

            <div class="form-group">
              <label for="newPassword">Nova lozinka</label>
              <div class="password-input">
                <input :type="showNewPassword ? 'text' : 'password'" id="newPassword" v-model="form.newPassword"
                  :class="{ 'error': errors.newPassword }" placeholder="Unesite novu lozinku" required />
                <button type="button" class="toggle-password" @click="showNewPassword = !showNewPassword">
                  <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <span v-if="errors.newPassword" class="error-message">{{ errors.newPassword }}</span>
              <div class="password-strength" v-if="form.newPassword">
                <div class="strength-bar">
                  <div class="strength-fill" :class="passwordStrength.class" :style="{ width: passwordStrength.width }">
                  </div>
                </div>
                <span class="strength-text" :class="passwordStrength.class">
                  {{ passwordStrength.text }}
                </span>
              </div>
            </div>

            <div class="form-group">
              <label for="confirmPassword">Potvrdite novu lozinku</label>
              <div class="password-input">
                <input :type="showConfirmPassword ? 'text' : 'password'" id="confirmPassword"
                  v-model="form.confirmPassword" :class="{ 'error': errors.confirmPassword }"
                  placeholder="Ponovite novu lozinku" required />
                <button type="button" class="toggle-password" @click="showConfirmPassword = !showConfirmPassword">
                  <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
            </div>

            <div v-if="error" class="error-message">
              {{ error }}
            </div>

            <div class="form-actions">
              <button type="button" class="btn secondary" @click="closeModal" :disabled="loading">
                Otkaži
              </button>
              <button type="submit" class="btn primary" :disabled="loading || !isFormValid">
                {{ loading ? 'Menjanje...' : 'Promeni lozinku' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts">
import { ref, computed, watch } from 'vue';
import { useProfileStore } from '@/stores/profileStore';

export default {
  name: 'ChangePasswordModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'success'], setup(props, { emit }) {
    const profileStore = useProfileStore();

    // Form data
    const form = ref({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    // Visibility toggles for password fields
    const showCurrentPassword = ref(false);
    const showNewPassword = ref(false);
    const showConfirmPassword = ref(false);    // Form errors
    const errors = ref({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    // General error state
    const error = ref('');

    // Loading state
    const loading = ref(false);

    // Password strength computation
    const passwordStrength = computed(() => {
      const password = form.value.newPassword;
      if (!password) return { class: '', width: '0%', text: '' };

      let score = 0;
      let feedback = [];

      // Length check
      if (password.length >= 8) score += 1;
      else feedback.push('najmanje 8 karaktera');

      // Character variety checks
      if (/[a-z]/.test(password)) score += 1;
      else feedback.push('mala slova');

      if (/[A-Z]/.test(password)) score += 1;
      else feedback.push('velika slova');

      if (/\d/.test(password)) score += 1;
      else feedback.push('brojevi');

      if (/[^a-zA-Z\d]/.test(password)) score += 1;
      else feedback.push('specijalni karakteri'); const strength: Record<number, { class: string; width: string; text: string }> = {
        0: { class: 'very-weak', width: '20%', text: 'Vrlo slaba' },
        1: { class: 'weak', width: '40%', text: 'Slaba' },
        2: { class: 'fair', width: '60%', text: 'Srednja' },
        3: { class: 'good', width: '80%', text: 'Dobra' },
        4: { class: 'strong', width: '100%', text: 'Jaka' },
        5: { class: 'very-strong', width: '100%', text: 'Vrlo jaka' }
      };

      return strength[score] || strength[0];
    });

    // Form validation
    const isFormValid = computed(() => {
      return form.value.currentPassword &&
        form.value.newPassword &&
        form.value.confirmPassword &&
        form.value.newPassword === form.value.confirmPassword &&
        form.value.newPassword.length >= 6 &&
        !Object.values(errors.value).some(error => error !== '');
    });

    // Validate form
    const validateForm = () => {
      errors.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };

      // Current password validation
      if (!form.value.currentPassword) {
        errors.value.currentPassword = 'Trenutna lozinka je obavezna';
      }

      // New password validation
      if (!form.value.newPassword) {
        errors.value.newPassword = 'Nova lozinka je obavezna';
      } else if (form.value.newPassword.length < 6) {
        errors.value.newPassword = 'Nova lozinka mora imati najmanje 6 karaktera';
      } else if (form.value.newPassword === form.value.currentPassword) {
        errors.value.newPassword = 'Nova lozinka mora se razlikovati od trenutne';
      }

      // Confirm password validation
      if (!form.value.confirmPassword) {
        errors.value.confirmPassword = 'Potvrda lozinke je obavezna';
      } else if (form.value.newPassword !== form.value.confirmPassword) {
        errors.value.confirmPassword = 'Lozinke se ne poklapaju';
      }

      return !Object.values(errors.value).some(error => error !== '');
    };

    // Handle form submission
    const handleSubmit = async () => {
      if (!validateForm()) {
        return;
      }

      loading.value = true;

      try {
        const success = await profileStore.changePassword(
          form.value.currentPassword,
          form.value.newPassword,
          form.value.confirmPassword
        );

        if (success) {
          emit('success');
          closeModal();
          resetForm();
        }
      } catch (error) {
        console.error('Error changing password:', error);
      } finally {
        loading.value = false;
      }
    };

    // Reset form
    const resetForm = () => {
      form.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
      errors.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
      showCurrentPassword.value = false;
      showNewPassword.value = false;
      showConfirmPassword.value = false;
    };

    // Close modal
    const closeModal = () => {
      emit('close');
      resetForm();
    };    // Watch for modal visibility changes
    watch(() => props.isVisible, (newValue) => {
      if (newValue) {
        resetForm();
      }
    });

    // Real-time validation
    watch(() => form.value.newPassword, () => {
      if (form.value.confirmPassword && errors.value.confirmPassword) {
        validateForm();
      }
    });

    watch(() => form.value.confirmPassword, () => {
      if (form.value.confirmPassword && form.value.newPassword !== form.value.confirmPassword) {
        errors.value.confirmPassword = 'Lozinke se ne poklapaju';
      } else {
        errors.value.confirmPassword = '';
      }
    }); return {
      form,
      errors,
      error,
      loading,
      showCurrentPassword,
      showNewPassword,
      showConfirmPassword,
      passwordStrength,
      isFormValid,
      handleSubmit,
      closeModal,
      validateForm
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
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  transform: scale(1);
  transition: all 0.3s ease;
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f8f9fa;
  border-radius: 12px 12px 0 0;
}

.modal-header h3 {
  margin: 0;
  color: #2d3748;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
  padding: 0.5rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.close-btn:hover {
  color: #1f2937;
  background: #e5e7eb;
}

.modal-body {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4b5563;
  font-size: 0.9rem;
}

.password-input {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input input {
  width: 100%;
  padding: 0.875rem 3rem 0.875rem 1rem;
  font-size: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.3s;
  background: white;
}

.password-input input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.password-input input.error {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.toggle-password {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.2s;
  border-radius: 4px;
}

.toggle-password:hover {
  color: #4b5563;
  background: #f3f4f6;
}

.error-message {
  color: #dc2626;
  margin: 0.5rem 0;
  font-size: 0.9rem;
  font-weight: 500;
}

.password-strength {
  margin-top: 0.75rem;
}

.strength-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 4px;
}

.strength-fill.very-weak {
  background: linear-gradient(90deg, #dc2626, #ef4444);
}

.strength-fill.weak {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.strength-fill.fair {
  background: linear-gradient(90deg, #eab308, #facc15);
}

.strength-fill.good {
  background: linear-gradient(90deg, #22c55e, #34d399);
}

.strength-fill.strong,
.strength-fill.very-strong {
  background: linear-gradient(90deg, #16a34a, #22c55e);
}

.strength-text {
  font-size: 0.875rem;
  font-weight: 600;
}

.strength-text.very-weak {
  color: #dc2626;
}

.strength-text.weak {
  color: #f59e0b;
}

.strength-text.fair {
  color: #eab308;
}

.strength-text.good {
  color: #22c55e;
}

.strength-text.strong,
.strength-text.very-strong {
  color: #16a34a;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
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

.btn.primary {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  box-shadow: 0 4px 6px rgba(99, 102, 241, 0.25);
}

.btn.primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #4f46e5, #4338ca);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(99, 102, 241, 0.3);
}

.btn.secondary {
  background: #f8f9fa;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.btn.secondary:hover:not(:disabled) {
  background: #e5e7eb;
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
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
    padding: 0;
    align-items: stretch;
    /* z-index handled by global styling */
  }

  .modal-content {
    width: 100%;
    height: 100vh;
    max-width: none;
    max-height: none;
    border-radius: 0;
    display: flex;
    flex-direction: column;
    /* Support for devices with notches/safe areas */
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
    /* Position handled by global styling */
  }

  .modal-header,
  .modal-body {
    padding: 1.5rem;
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
  }

  .form-actions {
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
