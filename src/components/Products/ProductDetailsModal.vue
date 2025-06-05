<template>
  <Teleport to="#modal-container" v-if="show">
    <div class="modal-overlay product-modal">
      <div class="modal-content">
        <button class="close-button" @click="closeModal">&times;</button>
        <div class="product-detail">
          <div v-if="loading" class="loading">Loading product details...</div>
          <div v-else-if="error" class="error">{{ error }}</div>
          <div v-else-if="product" class="product-container">
            <div class="product-image">
              <img :src="product.slika_url || '/images/placeholder-product.jpg'" :alt="product.naziv" />
            </div>
            <div class="product-info">
              <h2>{{ product.naziv }}</h2>
              <p class="description">{{ product.opis }}</p>
              <p class="price">{{ formatPrice(product.cena) }}</p>
              <div class="quantity-control">
                <button @click="decreaseQuantity" :disabled="quantity <= 1">
                  -
                </button>
                <span>{{ quantity }}</span>
                <button @click="increaseQuantity">+</button>
              </div>
              <div class="button-group">
                <button @click="handleAddToCart" class="add-to-cart-btn" :disabled="loading">
                  Dodaj u korpu
                </button>
                <button @click="navigateToDetails" class="view-details-btn">
                  Pogledaj detalje
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from "vue";
import { useRouter } from "vue-router";
import type { Product } from "@/models";
import { useNotification } from '@/utils/notifications'; // Add this import

const props = defineProps<{
  show: boolean; // Da li je modal vidljiv
  product: Product | null; // Proizvod koji se prikazuje u modalu
}>();

const emit = defineEmits(["close", "add-to-cart"]); // Događaji koje modal emituje

const quantity = ref(1);
const loading = ref(false);
const error = ref<string | null>(null);

const router = useRouter(); // Instanca router-a

const { showNotification } = useNotification(); // Add this line

// Zatvara modalni prozor
const closeModal = () => {
  emit("close");
};

// Povećava količinu proizvoda.
const increaseQuantity = () => {
  quantity.value++;
};

// Smanjuje količinu proizvoda, ali ne ispod 1
const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

// Dodaje proizvod u korpu.
const handleAddToCart = () => {
  if (!props.product) return;

  try {
    // Emit add-to-cart event to parent
    emit('add-to-cart', { product: props.product, quantity: quantity.value });

    // Show notification from modal component
    showNotification(`${props.product.naziv || 'Proizvod'} dodat u korpu.`, 'success');

    // Close the modal after adding
    emit('close');
  } catch (error) {
    console.error('Error adding product to cart:', error);
    showNotification('Greška pri dodavanju u korpu.', 'error');
  }
};

// Navigira na stranicu sa detaljima proizvoda.
const navigateToDetails = () => {
  if (props.product?.id) {
    router.push(`/product/${props.product.id}`);
    closeModal();
  }
};

// Formatira cenu u EUR format
const formatPrice = (price: number | undefined): string => {
  if (!price) return "Nije dostupno";
  return new Intl.NumberFormat("sr-RS", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
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
  background: radial-gradient(circle at center,
      rgba(0, 0, 0, 0.7) 0%,
      rgba(0, 0, 0, 0.8) 100%);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
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
.product-info>* {
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
  .modal-overlay {
    padding: 0 !important;
    align-items: stretch !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    /* z-index handled by global styling */
  }

  .modal-content {
    width: 100% !important;
    height: 100vh !important;
    max-width: none !important;
    max-height: none !important;
    border-radius: 0 !important;
    display: flex !important;
    flex-direction: column !important;
    overflow-y: auto !important;
    /* Support for devices with notches/safe areas */
    padding-top: env(safe-area-inset-top) !important;
    padding-bottom: env(safe-area-inset-bottom) !important;
    margin: 0 !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    /* z-index handled by global styling */
  }

  .product-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .modal-content {
    padding: 1rem;
  }

  .close-button {
    top: 1rem;
    right: 1rem;
    z-index: 10;
    padding: 1rem;
    font-size: 1.75rem;
    min-width: 44px;
    min-height: 44px;
  }

  .add-to-cart-btn,
  .view-details-btn {
    min-height: 44px;
    font-size: 1rem;
  }
}
</style>
