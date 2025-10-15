<template>
  <nav class="navbar">
    <router-link to="/" class="logo">NextOn</router-link>
    <div class="hamburger-wrapper" @click="toggleMenu">
      <button class="hamburger" :class="{ active: isMenuOpen }" aria-label="Menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div> <!-- Mobile menu with CSS animations -->
    <ul class="nav-links" :class="{ active: isMenuOpen }">
      <li v-for="link in navLinks" :key="link.path">
        <router-link :to="link.path" active-class="active" @click="closeMenu">
          {{ link.name }}
        </router-link>
      </li> <!-- Add cart link with item count -->
      <li class="cart-link">
        <router-link to="/cart" class="cart-button" @click="closeMenu">
          <span class="cart-icon">
            <i class="fas fa-shopping-cart"></i>
            <span v-if="cartStore.itemCount > 0" class="cart-count">{{ cartStore.itemCount }}</span>
          </span>
          <span class="cart-text">Korpa</span>
        </router-link>
      </li>

      <li class="auth-links">
        <template v-if="authStore.isAuthenticated">
          <ProfileDropdown :username="authStore.user?.username || 'Profile'" @close="closeMenu" />
        </template>
        <template v-else>
          <router-link to="/login" class="auth-button" @click="closeMenu">
            Prijava
          </router-link>
        </template>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import ProfileDropdown from "./ProfileDropdown.vue";

export default {
  name: 'Navbar',
  components: {
    ProfileDropdown
  },
  setup() {
    const authStore = useAuthStore();
    const cartStore = useCartStore();
    const isMenuOpen = ref(false);

    // Navigacioni linkovi
    const navLinks = [
      { path: "/", name: "Početna" },
      { path: "/products", name: "Proizvodi" },
      { path: "/about", name: "O nama" },
      { path: "/contact", name: "Kontakt" },
    ];

    const toggleMenu = () => {
      console.log("Toggling menu");
      isMenuOpen.value = !isMenuOpen.value;
    };

    const closeMenu = () => {
      isMenuOpen.value = false;
    };

    return {
      authStore,
      cartStore,
      isMenuOpen,
      navLinks,
      toggleMenu,
      closeMenu
    };
  }
}
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 8%;
  background-color: white;
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 11;
  border-bottom: 1px solid #e5e7eb;
}

.logo {
  font-family: 'LeckerliOne', cursive;
  font-size: 1.8em;
  font-weight: 700;
  color: #6366f1;
  text-decoration: none;
  transition: color 0.3s;
}

.logo:hover {
  color: #4f46e5;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin: 0;
  padding: 0;
  list-style: none;
  justify-content: center;
  flex: 1;
  max-width: 800px;
  margin: 0 auto;
}

.nav-links li {
  width: auto;
  max-width: none;
}

.nav-links a {
  color: #4b5563;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  white-space: nowrap;
  display: inline-block;
  width: auto;
}

.nav-links a:hover,
.nav-links a.active {
  background-color: #f3f4f6;
  color: #6366f1;
}

.auth-links {
  margin-left: 2rem;
  width: auto;
  max-width: none !important;
  z-index: 100;
}

.hamburger-wrapper {
  position: relative;
  z-index: 11;
  display: none;
}

.hamburger {
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
  padding: 10px;
  background: transparent;
  border: none;
  outline: none;
}

@media (max-width: 960px) {
  .hamburger-wrapper {
    display: block;
  }

  .hamburger {
    display: flex;
    flex-direction: column;
    gap: 6px;
    cursor: pointer;
    z-index: 1001;
    padding: 8px;
    /* Increase hit area */
    min-width: 44px;
    min-height: 44px;
    align-items: center;
    justify-content: center;
  }

  .hamburger span {
    width: 28px;
    height: 3px;
    background: #4b5563;
    transition: 0.3s;
    border-radius: 3px;
  }

  .hamburger.active span:nth-child(1) {
    transform: translateY(9px) rotate(45deg);
  }

  .hamburger.active span:nth-child(2) {
    opacity: 0;
  }

  .hamburger.active span:nth-child(3) {
    transform: translateY(-9px) rotate(-45deg);
  }

  .nav-links {
    position: fixed;
    inset: 0 0 0 0;
    background: white;
    padding: 5rem 1.5rem 2rem;
    flex-direction: column;
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
    box-shadow: -4px 0 15px rgba(0, 0, 0, 0.1);
    z-index: 9;
    gap: 0.5rem;
  }

  .nav-links.active {
    transform: translateX(0);
  }

  .nav-links li {
    width: 100%;
    max-width: none;
  }

  .nav-links a {
    width: 100%;
    padding: 1rem 1.5rem;
    text-align: left;
    font-size: 1.1rem;
    border-radius: 8px;
  }

  .nav-links a:hover,
  .nav-links a.active {
    background-color: #f3f4f6;
    color: #6366f1;
    padding-left: 2rem;
  }

  .auth-links {
    max-width: none !important;
    margin: 0;
    width: 100%;
    padding: 0;
    border: none;
  }
}

/* Add cart icon styles */
.cart-link {
  margin-left: 0.5rem;
}

.cart-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white !important;
  padding: 0.5rem 1rem !important;
  border-radius: 30px !important;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(99, 102, 241, 0.2);
  font-weight: 600;
}

.cart-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(99, 102, 241, 0.3);
  background: linear-gradient(135deg, #4f46e5, #4338ca);
}

.cart-icon {
  position: relative;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-text {
  font-size: 0.95rem;
  font-weight: 600;
}

.cart-count {
  position: absolute;
  top: -8px;
  right: -12px;
  background: #ef4444;
  color: white;
  font-size: 0.7rem;
  min-width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
  animation: pulse-light 2s infinite;
}

@keyframes pulse-light {
  0% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5);
  }

  70% {
    box-shadow: 0 0 0 6px rgba(239, 68, 68, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
}

/* Ensure cart link is visible on mobile */
@media (max-width: 960px) {
  .cart-link {
    width: 100%;
    text-align: left;
    margin: 0;
  }

  .cart-button {
    width: 100%;
    justify-content: flex-start;
    border-radius: 8px !important;
    padding: 1rem 1.5rem !important;
    margin-bottom: 0.5rem;
    background: #6366f1;
  }

  .cart-icon {
    font-size: 1.25rem;
    margin-right: 0.5rem;
  }

  .cart-text {
    font-size: 1.1rem;
  }

  .cart-count {
    top: -8px;
    right: -12px;
    font-size: 0.75rem;
    min-width: 20px;
    height: 20px;
  }
}
</style>
