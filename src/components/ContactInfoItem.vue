<template>
  <div class="info-item animate-fade-in" :style="{ animationDelay: delay + 's' }">
    <div class="icon-wrapper">
      <i :class="`fas fa-${icon}`"></i>
    </div>
    <div class="info-content">
      <h3>{{ title }}</h3>
      <p v-for="(detail, index) in details" :key="index">{{ detail }}</p>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "ContactInfoItem",
  props: {
    icon: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    details: {
      type: Array as () => string[],
      required: true
    },
    delay: {
      type: Number,
      required: true
    }
  },
  setup() {
    // No additional setup logic needed for this component
    return {};
  }
}
</script>

<style scoped>
.info-item {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
  /* Add space between items */
}

.info-item:last-child {
  margin-bottom: 0;
  /* Remove margin from last item */
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background: #6366f1;
  border-radius: 12px;
  color: white;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.info-content h3 {
  color: #2d3748;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.info-content p {
  color: #4a5568;
  line-height: 1.5;
}

.info-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.info-item:hover .icon-wrapper {
  transform: scale(1.1) rotate(10deg);
}

@media (max-width: 480px) {
  .info-item {
    padding: 1rem;
    gap: 1rem;
  }

  .icon-wrapper {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
}
</style>
