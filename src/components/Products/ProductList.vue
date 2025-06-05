<template>
  <div :class="['product-list', `view-${viewMode}`]">
    <div class="products-container" :class="viewMode">
      <ProductCard v-for="product in products" :key="product.id" :product="product" :viewMode="viewMode"
        :isAdmin="isAdmin" @view-product="$emit('view-product', $event)" @add-to-cart="$emit('add-to-cart', $event)"
        @product-deleted="handleProductDeleted" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import type { Product } from "@/models";
import ProductCard from "@/components/Products/ProductCard.vue";
import { useAuthStore } from '@/stores/authStore';
import { useNotification } from "@/utils/notifications";

export default defineComponent({
  name: "ProductList",
  components: {
    ProductCard,
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
  emits: ["add-to-cart", "view-product", "product-deleted"],
  setup(_props, { emit }) {
    const authStore = useAuthStore();
    const isAdmin = computed(() => authStore.isAdmin);
    const { showNotification } = useNotification();

    const handleProductDeleted = (productId: number) => {
      emit('product-deleted', productId);
      showNotification("Proizvod je uspešno obrisan!", "success");
    };

    return {
      isAdmin,
      handleProductDeleted,
    };
  },
});
</script>

<style scoped>
.product-list {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
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
