<template>
  <div v-if="!isLoading" class="product-list" v-show="products?.length">
    <div
      v-for="product in products"
      :key="product.id"
      class="product-card"
      @click="handleProductClick(product)"
    >
      <div class="product-image">
        <img
          :src="product.image_url || '/placeholder-image.png'"
          :alt="product.name || 'Product image'"
          loading="lazy"
        />
      </div>
      <div class="product-info">
        <h3>{{ product.name }}</h3>
        <p class="description">
          {{ product.description ? truncateText(product.description, 100) : "No description available" }}
        </p>
        <p class="price">{{ formatPrice(product.price) }}</p>
        <button
          @click.stop="handleAddToCart(product)"
          class="add-to-cart-btn"
          :disabled="isAddingToCart"
        >
          {{ isAddingToCart ? "Adding..." : "Add to Cart" }}
        </button>
      </div>
    </div>
  </div>
  <div v-else-if="isLoading" class="loading">
    <span class="loader"></span>
    Loading products...
  </div>
  <div v-else class="no-products">No products available.</div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { Product } from "@/types";

defineProps<{
  products: Product[];
  isLoading?: boolean;
}>();

const emit = defineEmits<{
  'add-to-cart': [{ product: Product; quantity: number }];
  'view-product': [Product];
}>();

const isAddingToCart = ref(false);

const handleProductClick = (product: Product) => {
  // Remove router navigation, only emit view event
  emit('view-product', product);
};

const formatPrice = (price: number | undefined): string => {
  if (!price) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
};

const truncateText = (text: string, length: number): string => {
  if (!text) return "";
  return text.length > length ? `${text.substring(0, length)}...` : text;
};

const handleAddToCart = async (product: Product): Promise<void> => {
  if (!product) return;

  try {
    isAddingToCart.value = true;
    emit("add-to-cart", {
      product: {
        ...product,
        image_url: product.image_url || "/placeholder-image.png",
      },
      quantity: 1,
    });
  } catch (error) {
    console.error(error);
  } finally {
    isAddingToCart.value = false;
  }
};
</script>

<style scoped>
.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  cursor: pointer;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image {
  width: 100%;
  height: 300px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;  /* Changed from cover to contain */
}

.product-info {
  padding: 1.5rem;
}

.description {
  color: #666;
  margin: 0.5rem 0;
  font-size: 0.9rem;
}

.price {
  font-size: 1.25rem;
  font-weight: bold;
  color: #6366f1;
  margin: 1rem 0;
}

.add-to-cart-btn {
  width: 100%;
  padding: 0.8rem;
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

@media (max-width: 768px) {
  .product-list {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

.loading {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
}

/* Loader styles */
.loader {
  width: 24px;
  height: 24px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
  margin-right: 8px;
}

.add-to-cart-btn:disabled {
  background: #a5a6f6;
  cursor: not-allowed;
}

.no-products {
  text-align: center;
  padding: 2rem;
  color: #666;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
