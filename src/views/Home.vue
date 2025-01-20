<template>
  <div class="home">
    <main class="main-content">
      <header class="hero animate-fade-in">
        <div class="hero-content">
          <h1>Welcome to our <span class="highlight">eCommerce Store</span></h1>
          <p>Discover amazing products curated just for you</p>
          <div class="hero-buttons">
            <button class="shop-now" @click="$router.push('/products')">
              Shop Now
            </button>
            <button class="shop-now" @click="$router.push('/login')">
              Get Started
            </button>
          </div>
        </div>
      </header>
      // ...existing code...
    </main>
  </div>
</template>

<script setup lang="ts">
// ...existing code...
</script>

<style scoped>
// ...existing code...

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.shop-now {
  padding: 1rem 2.5rem;
  font-size: 1.1em;
  background-color: white;
  color: #6366f1;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  animation: bounceIn 1s ease-out 0.6s backwards;
}

.shop-now:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

// ...existing code until media queries...

@media (max-width: 768px) {
  .hero h1 {
    font-size: 2em;
  }

  .hero p {
    font-size: 1em;
  }

  .hero-buttons {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }

  .shop-now {
    width: 100%;
  }
}

// ...remaining existing animation keyframes...

/* Remove the .login-button related styles as they're no longer needed */
</style>
