<template>
  <div class="auth-container">
    <div class="auth-card animate-slide-up">
      <h2>Kreirajte Nalog</h2>
      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <input type="text" v-model="username" placeholder="Korisničko ime" required
            :class="{ error: usernameError }" />
          <span class="validation-error" v-if="usernameError">{{
            usernameError
          }}</span>
        </div>
        <div class="form-group">
          <input type="email" v-model="email" placeholder="Email" required :class="{ error: emailError }" />
          <span class="validation-error" v-if="emailError">{{
            emailError
          }}</span>
        </div>
        <div class="form-group">
          <input type="password" v-model="password" placeholder="Lozinka" required :class="{ error: passwordError }" />
          <span class="validation-error" v-if="passwordError">{{
            passwordError
          }}</span>
          <div class="password-requirements">
            <p>Lozinka mora sadržati:</p>
            <ul>
              <li :class="{ met: hasMinLength }">Minimum 8 karaktera</li>
              <li :class="{ met: hasUpperCase }">Jedno veliko slovo</li>
              <li :class="{ met: hasLowerCase }">Jedno malo slovo</li>
              <li :class="{ met: hasNumber }">Jedan broj</li>
            </ul>
          </div>
        </div>
        <div class="form-group">
          <input type="password" v-model="confirmPassword" placeholder="Potvrdite lozinku" required />
        </div>
        <div v-if="authStore.error" class="error-message">
          {{ authStore.error }}
        </div>
        <button type="submit" class="submit-btn" :disabled="authStore.loading || !isValid">
          {{ authStore.loading ? "Kreiranje naloga..." : "Registracija" }}
        </button>
      </form>
      <p class="auth-switch">
        Već imate nalog?
        <router-link to="/login">Prijavite se ovde</router-link>
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import { useNotification } from "@/utils/notifications";

export default {
  name: "RegisterView",
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const { showNotification } = useNotification();

    // Reaktivne promenljive za polja forme
    const username = ref("");
    const email = ref("");
    const password = ref("");
    const confirmPassword = ref("");

    // Reaktivne promenljive za greške validacije
    const usernameError = ref("");
    const emailError = ref("");
    const passwordError = ref("");

    // Izračunate promenljive za proveru uslova lozinke
    const hasMinLength = computed(() => password.value.length >= 8);
    const hasUpperCase = computed(() => /[A-Z]/.test(password.value));
    const hasLowerCase = computed(() => /[a-z]/.test(password.value));
    const hasNumber = computed(() => /\d/.test(password.value));

    // Provera da su svi uslovi za lozinku ispunjeni
    const isValid = computed(() => {
      return (
        !usernameError.value &&
        !emailError.value &&
        !passwordError.value &&
        hasMinLength.value &&
        hasUpperCase.value &&
        hasLowerCase.value &&
        hasNumber.value &&
        password.value === confirmPassword.value
      );
    });

    // Validacija forme
    const validateForm = () => {
      // Resetuj greške
      usernameError.value = "";
      emailError.value = "";
      passwordError.value = "";

      // Validacija korisničkog imena
      if (username.value.length < 3) {
        usernameError.value = "Korisničko ime mora imati najmanje 3 karaktera";
        return false;
      }

      // Validacija email-a
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.value)) {
        emailError.value = "Unesite validnu email adresu";
        return false;
      }

      // Validacija lozinke
      if (!hasMinLength.value || !hasUpperCase.value || !hasLowerCase.value || !hasNumber.value) {
        passwordError.value = "Lozinka ne ispunjava sve uslove";
        return false;
      }

      // Validacija potvrde lozinke
      if (password.value !== confirmPassword.value) {
        passwordError.value = "Lozinke se ne poklapaju";
        return false;
      }

      return true;
    };

    const handleRegister = async () => {
      if (!validateForm()) return;

      const response = await authStore.register({
        username: username.value,
        email: email.value,
        password: password.value,
      });

      if (response.success) {
        showNotification?.("Uspešna registracija", "success");
        router.push("/");
      } else {
        // Prikazuje poruku o grešci
        showNotification?.(response.error || "Greška pri registraciji", "error");
      }
    };

    return {
      username,
      email,
      password,
      confirmPassword,
      usernameError,
      emailError,
      passwordError,
      hasMinLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      isValid,
      authStore,
      handleRegister
    };
  }
}
</script>

<style scoped>
.auth-container {
  min-height: calc(100vh - 80px);
  padding: 40px 20px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
}

.auth-card h2 {
  color: #2d3748;
  font-size: 2em;
  text-align: center;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 30px;
  font-size: 16px;
  transition: all 0.3s ease;
}

input:focus {
  border-color: #6366f1;
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  background: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(99, 102, 241, 0.3);
}

/* Add styling for disabled button */
.submit-btn:disabled {
  background-color: #a5a6f6;
  /* Lighter color */
  cursor: not-allowed;
  opacity: 0.7;
  transform: none;
  box-shadow: none;
}

.submit-btn:disabled:hover {
  background-color: #a5a6f6;
  transform: none;
  box-shadow: none;
}

.auth-switch {
  text-align: center;
  margin-top: 20px;
}

.auth-switch a {
  color: #6366f1;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.auth-switch a:hover {
  color: #4f46e5;
}

.animate-slide-up {
  animation: slideUp 0.6s ease-out forwards;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-message {
  color: #ef4444;
  text-align: center;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.password-requirements {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #64748b;
}

.password-requirements ul {
  list-style: none;
  padding-left: 1rem;
  margin-top: 0.25rem;
}

.password-requirements li {
  margin-bottom: 0.25rem;
}

.password-requirements li::before {
  content: "×";
  color: #dc2626;
  margin-right: 0.5rem;
}

.password-requirements li.met::before {
  content: "✓";
  color: #22c55e;
}

.validation-error {
  color: #dc2626;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  display: block;
}

input.error {
  border-color: #dc2626;
}

input.error:focus {
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}
</style>
