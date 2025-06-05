<template>
  <Teleport to="#modal-container" v-if="show">
    <div class="modal profile-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Izmeni Profil</h3>
          <button class="close-btn" @click="closeModal">
            <i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label for="name">Ime</label>
              <input type="text" id="name" v-model="formData.name" placeholder="Vaše ime" required
                :class="{ 'invalid': nameError }" />
              <div v-if="nameError" class="field-error">{{ nameError }}</div>
            </div>

            <div class="form-group">
              <label for="email">Email adresa</label>
              <input type="email" id="email" v-model="formData.email" placeholder="vasa.adresa@email.com" required
                :class="{ 'invalid': emailError }" />
              <div v-if="emailError" class="field-error">{{ emailError }}</div>
            </div>

            <div class="form-group">
              <label for="confirmEmail">Potvrdi email adresu</label>
              <input type="email" id="confirmEmail" v-model="formData.confirmEmail" placeholder="Ponovi email adresu"
                required :class="{ 'invalid': confirmEmailError }" />
              <div v-if="confirmEmailError" class="field-error">{{ confirmEmailError }}</div>
            </div>

            <div v-if="error" class="error-message">
              {{ error }}
            </div>

            <div class="form-actions">
              <button type="button" class="btn secondary" @click="closeModal">
                Otkaži
              </button>
              <button type="submit" class="btn primary" :disabled="loading || !hasChanges">
                <i class="fas fa-save" v-if="!loading"></i>
                <i class="fas fa-spinner fa-spin" v-if="loading"></i>
                {{ loading ? "Čuvanje..." : "Sačuvaj Promene" }}
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
import type { User } from '@/models/auth';

export default {
  name: "EditProfileModal",
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    user: {
      type: Object as () => User | null,
      required: true,
    },
  },
  emits: ['close', 'update:profile'],
  setup(props, { emit }) {
    const profileStore = useProfileStore();
    const loading = ref(false);
    const error = ref('');    // Create a reactive copy of the user data
    const formData = ref({
      name: '',
      email: '',
      confirmEmail: '',
    });

    // Validation computed properties
    const nameError = computed(() => {
      if (!formData.value.name) return '';
      if (formData.value.name.trim().length < 2) {
        return 'Ime mora imati najmanje 2 karaktera';
      }
      if (formData.value.name.trim().length > 50) {
        return 'Ime ne može biti duže od 50 karaktera';
      }
      if (!/^[a-zA-ZšđčćžŠĐČĆŽ\s]+$/u.test(formData.value.name.trim())) {
        return 'Ime može sadržati samo slova i razmake';
      }
      return '';
    });

    const emailError = computed(() => {
      if (!formData.value.email) return '';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.value.email)) {
        return 'Unesite validnu email adresu';
      }
      if (formData.value.email.length > 100) {
        return 'Email adresa ne može biti duža od 100 karaktera';
      }
      return '';
    });

    const confirmEmailError = computed(() => {
      if (!formData.value.confirmEmail) return '';
      if (formData.value.email !== formData.value.confirmEmail) {
        return 'Email adrese se ne poklapaju';
      }
      return '';
    });

    const isFormValid = computed(() => {
      return !nameError.value &&
        !emailError.value &&
        !confirmEmailError.value &&
        formData.value.name.trim() &&
        formData.value.email.trim() &&
        formData.value.confirmEmail.trim();
    });    // Reset form data when modal is shown or user changes
    watch(
      () => [props.show, props.user],
      ([showVal, userVal]) => {
        if (showVal && userVal && typeof userVal === 'object') {
          formData.value.name = userVal.name || '';
          formData.value.email = userVal.email || '';
          formData.value.confirmEmail = userVal.email || '';
          error.value = '';
        }
      },
      { immediate: true }
    );    // Check if there are any changes to save
    const hasChanges = computed(() => {
      if (!props.user) return false;
      return (
        formData.value.name !== props.user.name ||
        formData.value.email !== props.user.email
      ) && isFormValid.value;
    }); const handleSubmit = async () => {
      // Validate form before submitting
      if (!isFormValid.value) {
        error.value = 'Molimo ispravite greške u formi pre čuvanja.';
        return;
      }

      if (!hasChanges.value) {
        emit('close');
        return;
      }

      loading.value = true;
      error.value = '';

      try {
        const success = await profileStore.updateUserProfile({
          name: formData.value.name.trim(),
          email: formData.value.email.trim(),
        });

        if (success) {
          emit('update:profile', profileStore.profile);
          emit('close');
        }
      } catch (err: any) {
        console.error('Error in profile update:', err);
        error.value = err.message || 'Došlo je do greške pri ažuriranju profila.';
      } finally {
        loading.value = false;
      }
    }; const closeModal = () => {
      emit('close');
    };

    return {
      formData,
      loading,
      error,
      hasChanges,
      isFormValid,
      nameError, emailError,
      confirmEmailError,
      handleSubmit,
      closeModal
    };
  },
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
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
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

.form-group input {
  width: 100%;
  padding: 0.875rem 1rem;
  font-size: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.3s;
  background: white;
}

.form-group input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-group input.invalid {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.form-group input.invalid:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.field-error {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  font-weight: 500;
}

.error-message {
  color: #dc2626;
  margin: 0.5rem 0;
  font-size: 0.9rem;
  font-weight: 500;
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

  .close-btn {
    padding: 1rem;
    font-size: 1.75rem;
    min-width: 44px;
    min-height: 44px;
  }
}
</style>
