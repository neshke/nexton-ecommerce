<template>
  <div class="card">
    <div class="avatar-section">
      <div class="avatar">{{ user?.name?.[0]?.toUpperCase() || '?' }}</div>
      <button class="edit-btn">
        <i class="fas fa-camera"></i>
      </button>
    </div>
    <h2>{{ user?.name || 'Guest User' }}</h2>
    <p>{{ user?.email || 'No email provided' }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  user: { name?: string; email?: string } | null;
}>();
</script>

<style scoped>
@import "../../assets/styles/shared.css";

.avatar-section {
  position: relative;
  display: inline-block;
  margin-bottom: 1.5rem;
}

.avatar {
  width: 120px;
  height: 120px;
  display: grid;
  place-items: center;
  font-size: 3rem;
}

.edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #6366f1;
  color: white;
  cursor: pointer;
  transition: transform 0.3s;
}

.edit-btn:hover {
  transform: scale(1.1);
  background: #4f46e5;
}

h2 {
  margin: 1rem 0 0.5rem;
  color: #2d3748;
}

p {
  color: #666;
}
</style>
