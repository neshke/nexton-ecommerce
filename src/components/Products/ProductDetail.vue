<template>
  <div class="product-detail">
    <button class="close-btn" @click="goBack">
      ✕
    </button>
    <div v-if="loading" class="loading animate-fade-in">Loading product details...</div>
    <div v-else-if="error" class="error animate-fade-in">{{ error }}</div>
    <div v-else-if="product" class="product-container animate-slide-up">
      <div class="product-image animate-fade-in">
        <div 
          class="image-container"
          @mousemove="handleZoom"
          @mouseleave="isZoomed = false"
          :class="{ 'is-zoomed': isZoomed }"
        >
          <img
            :src="product.image_url || PLACEHOLDER_IMAGE"
            :alt="product.name"
            @error="handleImageError"
            :class="{ 
              'is-placeholder': isPlaceholder(product.image_url),
              'zoom-image': !isPlaceholder(product.image_url)
            }"
            ref="productImage"
          />
        </div>
      </div>
      <div class="product-info animate-slide-up">
        <h2>{{ product.name }}</h2>
        <p class="description">{{ product.description }}</p>
        <p class="price">{{ formatPrice(product.price) }}</p>
        <div class="quantity-control">
          <button @click="decreaseQuantity" :disabled="quantity <= 1">-</button>
          <span>{{ quantity }}</span>
          <button @click="increaseQuantity">+</button>
        </div>
        <button
          @click="handleAddToCart"
          class="add-to-cart-btn"
          :disabled="loading"
        >
          Add to Cart
        </button>
      </div>
    </div>
  </div>
  <div
    v-if="notification?.message"
    class="notification"
    :class="notification.type"
  >
    {{ notification.message }}
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProductStore } from "@/stores/productStore";
import { useNotification } from "@/utils/notifications";
import { PLACEHOLDER_IMAGE } from "@/utils/constants";
import type { Product } from "@/types";

const route = useRoute();
const router = useRouter();
const store = useProductStore();
const quantity = ref(1);
const loading = ref(false);
const error = ref<string | null>(null);
const { notification, showNotification } = useNotification();

// Use computed property to get product from store
const product = computed(() => {
  const productId = Number(route.params.id);
  return store.getProducts.find(p => p.id === productId) || null;
});

onMounted(async () => {
  const productId = Number(route.params.id);
  if (!productId) {
    error.value = "Invalid product ID";
    return;
  }

  try {
    loading.value = true;
    await store.fetchProducts();
    if (!product.value) {
      error.value = "Product not found";
    }
  } catch (err) {
    error.value = "Failed to load product details";
    console.error(err);
  } finally {
    loading.value = false;
  }
});

const increaseQuantity = () => {
  quantity.value++;
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const handleAddToCart = () => {
  if (!product.value) return;

  try {
    store.addToCart({
      product: product.value,
      quantity: quantity.value,
    });
    showNotification("Product added to cart", "success");
  } catch (error) {
    showNotification("Failed to add product to cart", "error");
  }
};

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  if (!isPlaceholder(img.src)) {
    img.src = PLACEHOLDER_IMAGE;
  }
};

const isPlaceholder = (url: string | null): boolean => {
  return !url || url === PLACEHOLDER_IMAGE;
};

// Add this new method to handle price formatting
const formatPrice = (price: number | undefined) => {
  return price !== undefined ? `$${price.toFixed(2)}` : 'Price not available';
};

const isZoomed = ref(false);
const productImage = ref<HTMLImageElement | null>(null);

const handleZoom = (event: MouseEvent) => {
  if (!productImage.value || isPlaceholder(product.value?.image_url || null)) return;
  
  const image = productImage.value;
  const { left, top, width, height } = image.getBoundingClientRect();
  
  const x = (event.clientX - left) / width;
  const y = (event.clientY - top) / height;
  
  image.style.transformOrigin = `${x * 100}% ${y * 100}%`;
  isZoomed.value = true;
};

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.product-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.product-image {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
  max-width: 600px; /* Match container max-width */
  margin: 0 auto; /* Center image container */
}

.product-image img {
  max-width: 100%;
  height: auto;
  object-fit: contain;
  aspect-ratio: 1;
  max-height: 500px; /* Add maximum height */
  max-width: 600px; /* Add maximum width */
}

.product-info {
  padding: 1rem;
}

.price {
  font-size: 1.5rem;
  font-weight: bold;
  color: #6366f1;
  margin: 1rem 0;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
}

.quantity-control button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

.quantity-control button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.product-detail {
  position: relative; /* Add this */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 80px);
  padding: 2rem 0;
  width: 100%; /* Add this */
}
.product-detail img {
  max-width: 100%;
  height: auto;
}

.add-to-cart-btn {
  width: 100%;
  padding: 1rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.add-to-cart-btn:hover {
  background: #4f46e5;
}

.loading {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
}

.error {
  color: red;
  text-align: center;
  padding: 1rem;
}

.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 1rem;
  border-radius: 8px;
  color: white;
  z-index: 1000;
}

.notification.success {
  background-color: #10b981;
}

.notification.error {
  background-color: #ef4444;
}

.is-placeholder {
  background-color: #f3f4f6;
  object-fit: contain !important;
}

/* Animation Classes */
.animate-fade-in {
  animation: fadeIn 1s ease-out forwards;
  opacity: 0;
}

.animate-slide-up {
  animation: slideUp 0.8s ease-out forwards;
  opacity: 0;
}

/* Animation Keyframes */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
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

/* Optimize animations for better performance */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in,
  .animate-slide-up {
    animation: none;
    opacity: 1;
  }
}

@media (max-width: 1024px) {
  .product-container {
    padding: 1.5rem;
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .product-container {
    grid-template-columns: 1fr;
    padding: 1rem;
  }

  .product-image {
    max-height: 400px;
  }

  .quantity-control {
    justify-content: center;
  }

  .product-info {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .product-container {
    padding: 0.5rem;
  }

  .product-image {
    max-height: 300px;
  }

  .quantity-control button {
    padding: 0.5rem;
  }

  .notification {
    left: 20px;
    right: 20px;
    bottom: 20px;
    text-align: center;
  }
}

.image-container {
  position: relative;
  width: 100%;
  max-width: 600px; /* Add maximum width */
  height: 500px;
  overflow: hidden;
  border-radius: 8px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto; /* Center container */
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.zoom-image {
  cursor: zoom-in;
}

.is-zoomed .zoom-image {
  transform: scale(2);
  cursor: zoom-out;
}

/* Update media queries for consistent image size */
@media (max-width: 1024px) {
  .image-container {
    height: 400px;
  }
}

@media (max-width: 768px) {
  .image-container {
    height: 350px;
  }
}

@media (max-width: 480px) {
  .image-container {
    height: 300px;
  }
}

/* Disable zoom on touch devices */
@media (hover: none) {
  .zoom-image {
    cursor: default;
  }
  
  .is-zoomed .zoom-image {
    transform: none;
  }
}

.close-btn {
  position: absolute; /* Change from fixed to absolute */
  top: 2rem;
  left: 2rem; /* Changed from right to left */
  width: 40px;
  height: 40px;
  background: #6366f1;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem; /* Increased font size */
  font-weight: 300; /* Made the X thinner */
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  z-index: 100;
  line-height: 0; /* Center the X vertically */
  padding-bottom: 3px; /* Fine-tune X position */
}

.close-btn:hover {
  transform: rotate(90deg);
  background-color: #4f46e5;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .close-btn {
    top: 1rem;
    left: 1rem; /* Changed from right to left */
    width: 35px;
    height: 35px;
    font-size: 1.2rem;
  }
}

/* Remove the old back-btn styles */
.back-btn {
  display: none;
}
</style>
