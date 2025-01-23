<template>
  <header class="hero animate-fade-in">
    <div class="hero-content">
      <h1>
        <span class="title-wrapper animate-slide-down">
          <slot name="title">
            {{ title }} <span class="highlight">{{ highlighted }}</span>
          </slot>
        </span>
      </h1>
      <p class="animate-slide-up" style="--delay: 0.3s">
        <slot name="subtitle">{{ subtitle }}</slot>
      </p>
      <div class="animate-fade-in" style="--delay: 0.6s">
        <slot name="actions"></slot>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title?: string;
  highlighted?: string;
  subtitle?: string;
}>();
</script>

<style scoped>
.hero {
  padding: clamp(3rem, 8vw, 6rem) 2rem;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  text-align: center;
  margin: 0;
}

.hero-content {
  max-width: min(800px, 90%);
  margin: 0 auto;
}

.hero h1 {
  font-size: clamp(2rem, 5vw, 3.5rem);
  margin-bottom: 1rem;
  font-weight: 700;
  line-height: 1.2;
}

.highlight {
  color: #ffd700;
}

.hero p {
  font-size: clamp(1rem, 3vw, 1.4rem);
  margin-bottom: 2rem;
  opacity: 0.9;
}

@keyframes fadeIn {
  from { 
    opacity: 0; 
  }
  to { 
    opacity: 1; 
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

.animate-fade-in {
  opacity: 0;
  animation: fadeIn 0.8s ease-out forwards;
  animation-delay: var(--delay, 0s);
}

.animate-slide-down {
  opacity: 0;
  animation: slideDown 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  animation-delay: var(--delay, 0s);
}

.animate-slide-up {
  opacity: 0;
  animation: slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  animation-delay: var(--delay, 0s);
}

.title-wrapper {
  display: inline-block;
}

@media (prefers-reduced-motion: reduce) {
  .animate-fade-in,
  .animate-slide-down,
  .animate-slide-up {
    animation: none;
    opacity: 1;
  }
}
</style>
