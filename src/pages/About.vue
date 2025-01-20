<template>
  <div class="about-page">
    <header class="hero animate-fade-in">
      <div class="hero-content">
        <h1 class="animate-slide-down">About <span class="highlight">Us</span></h1>
        <p class="animate-slide-up">Discover our story and mission</p>
      </div>
    </header>

    <main class="main-content">
      <section class="about-section">
        <div class="container">
          <div class="about-grid">
            <div class="about-text animate-slide-right">
              <h2>Our Story</h2>
              <p>
                Founded in 2023, we've been committed to bringing you the best
                products with outstanding service.
              </p>
              <h2>Our Mission</h2>
              <p>
                To provide high-quality products while ensuring an exceptional
                shopping experience for our customers.
              </p>
            </div>
            <div class="about-stats">
              <div 
                v-for="(stat, index) in ['1000+', '500+', '24/7']" 
                :key="stat"
                class="stat-item animate-scale-in"
                :style="{ animationDelay: `${index * 0.2}s` }"
              >
                <h3>{{ stat }}</h3>
                <p>{{ stat === '1000+' ? 'Happy Customers' : stat === '500+' ? 'Products' : 'Support' }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Footer from '@/components/Footer.vue';
</script>

<style scoped>
.about-page {
  min-height: 100vh;
}

.hero {
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  text-align: center;
}

.hero-content h1 {
  font-size: 3em;
  margin-bottom: 1rem;
}

.highlight {
  color: #ffd700;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
}

.about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.about-text h2 {
  color: #2d3748;
  margin-bottom: 1rem;
}

.about-text p {
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.about-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.stat-item {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-item:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.stat-item h3 {
  color: #6366f1;
  font-size: 2em;
  margin-bottom: 0.5rem;
  transition: transform 0.3s ease, color 0.3s ease;
}

.stat-item:hover h3 {
  transform: scale(1.1);
  color: #4f46e5;
}

@media (max-width: 768px) {
  .about-grid {
    grid-template-columns: 1fr;
  }

  .about-stats {
    grid-template-columns: 1fr;
  }
}

/* Animation Classes */
.animate-fade-in {
  animation: fadeIn 1s ease-out forwards;
}

.animate-slide-down {
  animation: slideDown 1s ease-out forwards;
}

.animate-slide-up {
  animation: slideUp 1s ease-out 0.3s backwards;
}

.animate-slide-right {
  animation: slideRight 1s ease-out forwards;
}

.animate-scale-in {
  animation: scaleIn 0.6s ease-out forwards;
  opacity: 0;
}

/* Animation Keyframes */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideRight {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
