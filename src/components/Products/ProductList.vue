<template>
  <div :class="['product-list', `view-${viewMode}`]">
    <div v-if="isAdmin" class="admin-controls">
      <button class="add-product-button" @click="$emit('add-product')">
        <i class="fas fa-plus"></i> Dodaj novi proizvod
      </button>
    </div>

    <div class="products-container" :class="viewMode">
      <ProductCard v-for="product in products" :key="product.id" :product="product" :viewMode="viewMode"
        @view-product="$emit('view-product', $event)" @add-to-cart="$emit('add-to-cart', $event)"
        @product-deleted="handleProductDeleted" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import type { Product } from "@/models";
import ProductCard from "@/components/Products/ProductCard.vue";
import { useAuthStore } from '@/stores/authStore';
import { computed } from "vue";

export default defineComponent({
  name: "ProductList",
  components: {
    ProductCard
  },
  props: {
    products: {
      type: Array as () => Product[],
      required: true,
    },
    viewMode: {
      type: String,
      default: "grid",
    }
  },
  emits: ["add-to-cart", "view-product", "add-product", "product-deleted"],
  setup(_props, { emit }) {
    const authStore = useAuthStore();
    const isAdmin = computed(() => authStore.isAdmin);

    const handleProductDeleted = (productId: number) => {
      emit('product-deleted', productId);
    };

    return {
      isAdmin,
      handleProductDeleted
    };
  },
});
</script>

<style scoped>
.product-list {
  width: 100%;
}

.products-container.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  grid-gap: 2rem;
}

.products-container.list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Admin controls */
.admin-controls {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}

.add-product-button {
  padding: 0.75rem 1.5rem;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-product-button:hover {
  background-color: #059669;
}

@media (max-width: 992px) {
  .products-container.grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    grid-gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .products-container.grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    grid-gap: 1rem;
  }
}

@media (max-width: 480px) {
  .products-container.grid {
    grid-template-columns: 1fr;
  }
}
</style>
