<template>
  <div class="product-detail">
    <button class="close-btn" @click="goBack">✕</button>
    <div v-if="loading" class="loading animate-fade-in">
      Učitavanje detalja proizvoda...
    </div>
    <div v-else-if="error" class="error animate-fade-in">{{ error }}</div>
    <div v-else-if="product" class="product-container animate-slide-up">
      <div class="product-image animate-fade-in">
        <div class="image-container" @mousemove="handleZoom" @mouseleave="isZoomed = false"
          :class="{ 'is-zoomed': isZoomed }">
          <img :src="product.slika_url || PLACEHOLDER_IMAGE" :alt="product.naziv" @error="handleImageError" :class="{
            'is-placeholder': isPlaceholder(product.slika_url),
            'zoom-image': !isPlaceholder(product.slika_url),
          }" ref="productImage" />
        </div>
      </div>
      <div class="product-info animate-slide-up">
        <h2>{{ product.naziv }}</h2>
        <p class="description">{{ product.opis }}</p>
        <p class="price">{{ formatPrice(product.cena) }}</p>
        <div class="quantity-control">
          <button @click="decreaseQuantity" :disabled="quantity <= 1">-</button>
          <span>{{ quantity }}</span>
          <button @click="increaseQuantity">+</button>
        </div>
        <button @click="handleAddToCart" class="add-to-cart-btn" :disabled="loading">
          Dodaj u korpu
        </button>

        <!-- Admin Buttons Section -->
        <div v-if="isAdmin" class="admin-buttons">
          <button @click="handleDeleteProduct" class="delete-btn">
            Obriši proizvod
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, onMounted, computed, defineComponent, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProductStore } from "@/stores/productStore";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { useNotification } from "@/utils/notifications";
import { PLACEHOLDER_IMAGE } from "@/utils/constants";
import type { Product } from "@/models";


export default defineComponent({

  setup() {
    const route = useRoute();
    const router = useRouter();
    const store = useProductStore();
    const cartStore = useCartStore();
    const authStore = useAuthStore();
    const { showNotification } = useNotification();

    const product = ref<Product | null>(null);
    const quantity = ref(1);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const isZoomed = ref(false);
    const productImage = ref<HTMLImageElement | null>(null);

    const productId = computed(() => parseInt(route.params.id as string, 10));

    const isAdmin = computed(() => authStore.user?.role === 'admin');

    const fetchProductDetails = async (id: number) => {
      loading.value = true;
      error.value = null;
      try {
        const fetchedProduct = await store.fetchProductById(id);
        if (fetchedProduct) {
          product.value = fetchedProduct;
        } else {
          throw new Error("Proizvod nije pronađen");
        }
      } catch (err: any) {
        error.value = err.message || "Neuspešno učitavanje detalja proizvoda";
        console.error("Greška pri dohvatanju detalja proizvoda:", err);
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      if (productId.value) {
        fetchProductDetails(productId.value);
      }
    });

    watch(productId, (newId) => {
      if (newId) {
        fetchProductDetails(newId);
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
        cartStore.addToCart({
          product: product.value,
          quantity: quantity.value,
        });
        showNotification("Proizvod dodat u korpu", "success");
      } catch (error) {
        showNotification("Greška prilikom dodavanja proizvoda u korpu", "error");
      }
    };

    const handleImageError = (e: Event) => {
      const img = e.target as HTMLImageElement;
      if (!isPlaceholder(img.src)) {
        img.src = PLACEHOLDER_IMAGE;
      }
    };

    // Proverava da li je URL slike placeholder
    const isPlaceholder = (url: string | undefined): boolean => {
      return !url || url === PLACEHOLDER_IMAGE;
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

    const handleZoom = (event: MouseEvent) => {
      if (!productImage.value || isPlaceholder(product.value?.slika_url || undefined))
        return;

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

    const handleDeleteProduct = async () => {
      if (!product.value) return;

      if (confirm('Da li ste sigurni da želite da obrišete ovaj proizvod?')) {
        try {
          loading.value = true;

          await store.deleteProduct(product.value.id);

          showNotification("Proizvod je uspešno obrisan", "success");
          router.push('/products');
        } catch (error: any) {
          console.error("Delete error:", error);
          showNotification(error.message || "Greška prilikom brisanja proizvoda", "error");
        } finally {
          loading.value = false;
        }
      }
    };


    return {
      product,
      quantity,
      loading,
      error,
      isAdmin,
      isZoomed,
      productImage,
      PLACEHOLDER_IMAGE,
      increaseQuantity,
      decreaseQuantity,
      handleAddToCart,
      handleImageError,
      isPlaceholder,
      formatPrice,
      handleZoom,
      goBack,
      handleDeleteProduct,
    };
  }
});
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
  max-width: 600px;
  /* Match container max-width */
  margin: 0 auto;
  /* Center image container */
}

.product-image img {
  max-width: 100%;
  height: auto;
  object-fit: contain;
  aspect-ratio: 1;
  max-height: 500px;
  /* Add maximum height */
  max-width: 600px;
  /* Add maximum width */
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
  position: relative;
  /* Add this */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 80px);
  padding: 2rem 0;
  width: 100%;
  /* Add this */
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

}

.image-container {
  position: relative;
  width: 100%;
  max-width: 600px;
  /* Add maximum width */
  height: 500px;
  overflow: hidden;
  border-radius: 8px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  /* Center container */
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
  position: absolute;
  /* Change from fixed to absolute */
  top: 2rem;
  left: 2rem;
  /* Changed from right to left */
  width: 40px;
  height: 40px;
  background: #6366f1;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  /* Increased font size */
  font-weight: 300;
  /* Made the X thinner */
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  z-index: 100;
  line-height: 0;
  /* Center the X vertically */
  padding-bottom: 3px;
  /* Fine-tune X position */
}

.close-btn:hover {
  transform: rotate(90deg);
  background-color: #4f46e5;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .close-btn {
    top: 1rem;
    left: 1rem;
    /* Changed from right to left */
    width: 35px;
    height: 35px;
    font-size: 1.2rem;
  }
}

/* Remove the old back-btn styles */
.back-btn {
  display: none;
}

.delete-btn {
  width: 100%;
  padding: 1rem;
  margin-top: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  background: #ef4444;
  /* Red color */
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.delete-btn:hover {
  background: #dc2626;
  /* Darker red on hover */
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(239, 68, 68, 0.2);
}
</style>
