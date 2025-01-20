<template>
  <Transition name="modal-backdrop">
    <div v-if="show" class="modal-overlay" @click="closeModal">
      <Transition name="modal-content">
        <div v-if="show" class="modal-content" @click.stop>
          <button class="close-button" @click="closeModal">&times;</button>
          <div class="product-detail">
            <div v-if="loading" class="loading">Loading product details...</div>
            <div v-else-if="error" class="error">{{ error }}</div>
            <div v-else-if="product" class="product-container">
              <div class="product-image">
                <img
                  :src="product.image_url || PLACEHOLDER_IMAGE"
                  :alt="product.name"
                  @error="handleImageError"
                  :class="{
                    'is-placeholder': isPlaceholder(product.image_url),
                  }"
                />
              </div>
              <div class="product-info">
                <h2>{{ product.name }}</h2>
                <p class="description">{{ product.description }}</p>
                <p class="price">{{ formatPrice(product.price) }}</p>
                <div class="quantity-control">
                  <button @click="decreaseQuantity" :disabled="quantity <= 1">
                    -
                  </button>
                  <span>{{ quantity }}</span>
                  <button @click="increaseQuantity">+</button>
                </div>
                <div class="button-group">
                  <button
                    @click="handleAddToCart"
                    class="add-to-cart-btn"
                    :disabled="loading"
                  >
                    Add to Cart
                  </button>
                  <button @click="navigateToDetails" class="view-details-btn">
                    View Full Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from "vue";
import { useRouter } from "vue-router";
import { PLACEHOLDER_IMAGE } from "@/utils/constants";
import type { Product } from "@/types";

const props = defineProps<{
  show: boolean;
  product: Product | null;
}>();

const emit = defineEmits(["close", "add-to-cart"]);

const quantity = ref(1);
const loading = ref(false);
const error = ref<string | null>(null);

const router = useRouter();

const closeModal = () => {
  emit("close");
};

const increaseQuantity = () => {
  quantity.value++;
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const handleAddToCart = () => {
  if (!props.product) return;
  emit("add-to-cart", { product: props.product, quantity: quantity.value });
  closeModal();
};

const navigateToDetails = () => {
  if (props.product?.id) {
    router.push(`/product/${props.product.id}`);
    closeModal();
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

const formatPrice = (price: number | undefined): string => {
  if (!price) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    circle at center,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.8) 100%
  );
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  max-width: 1000px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.close-button {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  border: none;
  background: #f3f4f6;
  font-size: 1.5rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 1;
}

.close-button:hover {
  background: #e5e7eb;
  transform: scale(1.1);
}

.product-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: start;
}

.product-image {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  background: #f9fafb;
  aspect-ratio: 1;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.4, 1.2);
}

.product-image img:hover {
  transform: scale(1.05);
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.product-info h2 {
  font-size: 2rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.description {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #4b5563;
}

.price {
  font-size: 2rem;
  font-weight: 700;
  color: #6366f1;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #f9fafb;
  padding: 0.5rem;
  border-radius: 8px;
  width: fit-content;
}

.quantity-control button {
  width: 36px;
  height: 36px;
  border: 2px solid #6366f1;
  background: white;
  color: #6366f1;
  font-size: 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.4, 1.2);
}

.quantity-control button:hover:not(:disabled) {
  background: #6366f1;
  color: white;
}

.quantity-control span {
  font-size: 1.2rem;
  font-weight: 600;
  min-width: 2rem;
  text-align: center;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.add-to-cart-btn {
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0;
}

.add-to-cart-btn:hover:not(:disabled) {
  background: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(99, 102, 241, 0.2);
}

.view-details-btn {
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  background: transparent;
  color: #6366f1;
  border: 2px solid #6366f1;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-details-btn:hover {
  background: #6366f1;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(99, 102, 241, 0.2);
}

/* Enhanced modal animations */
.modal-backdrop-enter-active,
.modal-backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.modal-backdrop-enter-from,
.modal-backdrop-leave-to {
  opacity: 0;
}

.modal-content-enter-active {
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.4, 1.2);
}

.modal-content-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 1, 1);
}

.modal-content-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(-60px);
}

.modal-content-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(60px);
}

/* Add transition to inner elements */
.product-info > * {
  animation: slideIn 0.5s ease forwards;
  opacity: 0;
}

.product-info h2 {
  animation-delay: 0.1s;
}
.product-info .description {
  animation-delay: 0.2s;
}
.product-info .price {
  animation-delay: 0.3s;
}
.product-info .quantity-control {
  animation-delay: 0.4s;
}
.product-info .button-group {
  animation-delay: 0.5s;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhance existing hover effects */
.close-button {
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.4, 1.2);
}

.close-button:hover {
  transform: scale(1.1) rotate(90deg);
}

@media (max-width: 768px) {
  .product-container {
    grid-template-columns: 1fr;
  }

  .modal-content {
    padding: 1.5rem;
  }

  .close-button {
    top: 1rem;
    right: 1rem;
  }
}
</style>
