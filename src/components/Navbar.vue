<template>
  <nav class="navbar">
    <router-link to="/" class="logo">NextOn</router-link>
    <div class="hamburger-wrapper" @click="toggleMenu">
      <button class="hamburger" :class="{ active: isMenuOpen }" aria-label="Menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
    <ul class="nav-links" :class="{ active: isMenuOpen }">
      <li v-for="link in navLinks" :key="link.path">
        <router-link :to="link.path" active-class="active" @click="closeMenu">
          {{ link.name }}
        </router-link>
      </li>

      <!-- Add cart link with item count -->
      <li class="cart-link">
        <router-link to="/cart" @click="closeMenu">
          <span class="cart-icon">
            <i class="fas fa-shopping-cart"></i>
            <span v-if="cartStore.itemCount > 0" class="cart-count">{{ cartStore.itemCount }}</span>
          </span>
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

    // Funkcija za uključivanje/isključivanje menija
    const toggleMenu = () => {
      isMenuOpen.value = !isMenuOpen.value;
      document.body.style.overflow = isMenuOpen.value ? "hidden" : "auto";
    };

    // Funkcija za zatvaranje menija
    const closeMenu = () => {
      isMenuOpen.value = false;
      document.body.style.overflow = "auto";
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
  z-index: 1000;
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
}

.hamburger-wrapper {
  position: relative;
  z-index: 1002;
  /* Higher than other elements */
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
    z-index: 1000;
    /* Lower than hamburger */
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
    margin: 2rem 0 0;
    width: 100%;
    padding: 1rem 0;
    border-top: 1px solid #e5e7eb;
  }
}

/* Add cart icon styles */
.cart-link {
  margin-left: 0.5rem;
}

.cart-icon {
  position: relative;
  font-size: 1.25rem;
  color: #4b5563;
  transition: color 0.3s ease;
}

.cart-icon:hover {
  color: #6366f1;
}

.cart-count {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #6366f1;
  color: white;
  font-size: 0.7rem;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

/* Ensure cart link is visible on mobile */
@media (max-width: 960px) {
  .cart-link {
    width: 100%;
    text-align: center;
    margin: 0.5rem 0;
  }

  .cart-icon {
    font-size: 1.5rem;
  }
}
</style>
