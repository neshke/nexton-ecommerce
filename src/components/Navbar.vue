<template>
  <nav class="navbar">
    <router-link to="/" class="logo">NextOn</router-link>
    <div class="hamburger" :class="{ active: isMenuOpen }" @click="toggleMenu">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <ul class="nav-links" :class="{ active: isMenuOpen }">
      <li>
        <router-link to="/" active-class="active" @click="closeMenu"
          >Home</router-link
        >
      </li>
      <li>
        <router-link to="/products" active-class="active" @click="closeMenu"
          >Products</router-link
        >
      </li>
      <li>
        <router-link to="/about" active-class="active" @click="closeMenu"
          >About</router-link
        >
      </li>
      <li>
        <router-link to="/contact" active-class="active" @click="closeMenu"
          >Contact</router-link
        >
      </li>
      <li class="auth-links">
        <router-link
          to="/login"
          class="auth-button login-btn"
          @click="closeMenu"
          >Login</router-link
        >
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { ref } from "vue";

const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
  document.body.style.overflow = isMenuOpen.value ? "hidden" : "auto";
};

const closeMenu = () => {
  isMenuOpen.value = false;
  document.body.style.overflow = "auto";
};
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 5%;
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.logo {
  font-size: 1.8em;
  font-weight: 700;
  color: #2c3e50;
  letter-spacing: 1px;
  text-decoration: none;
  transition: color 0.3s ease;
}

.logo:hover {
  color: #6366f1;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 48px; /* Increased from 32px */
  margin: 0;
  padding: 0;
}

.nav-links li {
  display: inline-block; /* Changed from inline */
  padding: 0.5rem 0; /* Added padding for better touch targets */
  position: relative; /* Added for better positioning */
}

.nav-links a {
  color: #666;
  text-decoration: none;
  font-size: 1.1em;
  font-weight: 500;
  padding: 1rem 1.2rem; /* Increased padding */
  transition: all 0.3s ease;
  position: relative;
  display: inline-block; /* Added for better hit area */
  margin: -0.5rem 0; /* Negative margin to compensate for padding */
}

.nav-links a:hover {
  color: #2c3e50;
}

.nav-links a::after {
  content: "";
  position: absolute;
  width: 0;
  height: 2px;
  bottom: 0;
  left: 0;
  background-color: #2c3e50;
  transition: width 0.3s ease;
}

.nav-links a:hover::after {
  width: 100%;
}

.nav-links a.active {
  color: #2c3e50;
}

.nav-links a.active::after {
  width: 100%;
}

.hamburger {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 30px;
  height: 25px;
  cursor: pointer;
  z-index: 1001;
}

.hamburger span {
  width: 100%;
  height: 3px;
  background-color: #2c3e50;
  transition: all 0.3s ease;
}

.auth-links {
  display: flex;
  margin-left: 2rem;
  align-items: center;
}

.auth-button {
  padding: 0.7rem 1.5rem !important;
  border-radius: 30px !important;
  transition: all 0.3s ease !important;
  font-weight: 600 !important;
  white-space: nowrap;
  min-width: 100px;
  text-align: center;
  background-color: #6366f1 !important;
  color: white !important;
  margin-bottom: 4rem !important;
}

.login-btn::after {
  display: none;
}

.auth-button:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 5px 15px rgba(99, 102, 241, 0.2) !important;
  background-color: #4f46e5 !important;
}

@media (max-width: 1024px) {
  .nav-links {
    gap: 32px; /* Adjusted for medium screens */
  }

  .auth-links {
    margin-left: 1rem;
    gap: 0.8rem;
  }

  .auth-button {
    padding: 0.6rem 1.2rem !important;
    min-width: 90px;
  }
}

@media (max-width: 768px) {
  .navbar {
    padding: 15px 4%;
  }

  .hamburger {
    display: flex;
  }

  .nav-links {
    position: fixed;
    top: 0;
    right: -100%;
    height: 100vh;
    width: 80%;
    max-width: 300px;
    flex-direction: column;
    background-color: white;
    padding: 80px 0 0 0; /* Remove horizontal padding */
    transition: right 0.3s ease;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    min-height: 100vh;
    padding-top: 80px;
    padding-bottom: 20px;
  }

  .nav-links.active {
    right: 0;
  }

  .nav-links li {
    width: 100%;
    padding: 0.8rem 20px; /* Increased vertical padding */
  }

  .nav-links a {
    display: block;
    padding: 1rem 1.5rem; /* Increased padding for mobile */
    margin: 0; /* Remove negative margin for mobile */
    width: 100%;
  }

  .hamburger.active span:nth-child(1) {
    transform: rotate(45deg) translate(8px, 8px);
  }

  .hamburger.active span:nth-child(2) {
    opacity: 0;
  }

  .hamburger.active span:nth-child(3) {
    transform: rotate(-45deg) translate(8px, -8px);
  }

  .auth-links {
    margin-top: auto !important;
    padding: 1rem 0; /* Remove horizontal padding */
    border-top: 1px solid #eee;
    width: 100%;
    margin-left: 0;
  }

  .auth-button {
    width: 100%;
    display: block;
    background-color: #6366f1 !important;
    color: white !important;
    padding: 1rem !important;
    margin: 0;
    text-align: center;
    border-radius: 0 !important; /* Remove border radius */
  }

  .auth-button:hover {
    background-color: #4f46e5 !important;
    transform: none !important; /* Remove transform */
    box-shadow: none !important;
    border-radius: 0 !important;
  }

  .nav-links li:last-child {
    margin-top: auto; /* Push to bottom */
    margin-bottom: 0;
    width: 100%;
    padding: 0; /* Remove padding from auth button container */
  }
}

@media (max-width: 480px) {
  .navbar {
    padding: 12px 3%;
  }

  .logo {
    font-size: 1.5em;
  }
}
</style>
