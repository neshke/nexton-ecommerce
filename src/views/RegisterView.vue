<template>
  <div class="auth-container">
    <div class="auth-card animate-slide-up">
      <h2>Create Account</h2>
      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <input type="text" v-model="name" placeholder="Full Name" required>
        </div>
        <div class="form-group">
          <input type="email" v-model="email" placeholder="Email" required>
        </div>
        <div class="form-group">
          <input type="password" v-model="password" placeholder="Password" required>
        </div>
        <div class="form-group">
          <input type="password" v-model="confirmPassword" placeholder="Confirm Password" required>
        </div>
        <button type="submit" class="submit-btn">Register</button>
      </form>
      <p class="auth-switch">
        Already have an account? 
        <router-link to="/login">Login here</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { Router } from 'vue-router';

const router: Router = useRouter();
const name = ref<string>('');
const email = ref<string>('');
const password = ref<string>('');
const confirmPassword = ref<string>('');

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

const handleRegister = async (): Promise<void> => {
  if (password.value !== confirmPassword.value) {
    alert('Passwords do not match');
    return;
  }

  const registerData: RegisterData = {
    name: name.value,
    email: email.value,
    password: password.value
  };

  try {
    // Add your registration logic here
    console.log('Register attempt:', registerData);
    await router.push('/login');
  } catch (error) {
    console.error('Registration error:', error);
    alert('Registration failed. Please try again.');
  }
};
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
</style>
