<template>
  <div class="products-section">
    <div class="products-container" :class="viewMode">
      <ProductCard v-for="product in filteredProducts" :key="product.id" :product="product" :viewMode="viewMode"
        @show-quick-view="handleQuickView" />
    </div>

    <div v-if="filteredProducts.length === 0 && !loading" class="no-products">
      <div class="no-products-message">
        <i class="fas fa-search"></i>
        <h3>Nema proizvoda</h3>
        <p>Žao nam je, nismo pronašli proizvode sa zadatim filterima.</p>
        <button @click="resetFilters" class="reset-button">Resetuj filtere</button>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Učitavanje proizvoda...</p>
    </div>

    <!-- Quick View Modal -->
    <QuickViewModal v-if="showQuickViewModal" :product="selectedProduct" @close="closeQuickViewModal" />
  </div>
</template>

<script lang="ts">
import { computed, ref } from "vue";
import { useProductStore } from "@/stores/productStore";
import { useCategoryStore } from "@/stores/categoryStore";
import type { Product, FilterOptions } from "@/models";
import ProductCard from "./ProductCard.vue";
import QuickViewModal from "./QuickViewModal.vue";

export default {
  components: {
    ProductCard,
    QuickViewModal,
  },

  props: {
    viewMode: {
      type: String,
      default: "grid",
    },
    sortBy: {
      type: String,
      default: "latest",
    },
    filters: {
      type: Object as () => FilterOptions,
      default: () => ({
        minPrice: null,
        maxPrice: null,
        categories: null,
      }),
    },
  },

  emits: ["reset-filters"],

  setup(props, { emit }) {
    const productStore = useProductStore();
    const categoryStore = useCategoryStore();
    const loading = computed(() => productStore.loading);
    const products = computed(() => productStore.products);

    // For quick view modal
    const showQuickViewModal = ref(false);
    const selectedProduct = ref<Product | null>(null);

    // Apply sorting and filtering
    const filteredProducts = computed(() => {
      if (loading.value || !products.value || products.value.length === 0) return [];

      let result = [...products.value];

      // Price filter
      if (props.filters.minPrice !== null) {
        result = result.filter(
          (product) => product.cena >= (props.filters.minPrice || 0)
        );
      }

      if (props.filters.maxPrice !== null) {
        result = result.filter(
          (product) => product.cena <= props.filters.maxPrice!
        );
      }

      // Category filter
      if (props.filters.categories && props.filters.categories.length > 0) {
        result = result.filter((product) => {
          return product.kategorija_id && props.filters.categories!.includes(product.kategorija_id);
        });
      }

      // Sorting
      switch (props.sortBy) {
        case "price-asc":
          result.sort((a, b) => a.cena - b.cena);
          break;
        case "price-desc":
          result.sort((a, b) => b.cena - a.cena);
          break;
        case "name-asc":
          result.sort((a, b) => a.naziv.localeCompare(b.naziv));
          break;
        case "name-desc":
          result.sort((a, b) => b.naziv.localeCompare(a.naziv));
          break;
        case "latest":
          result.sort((a, b) => {
            const dateA = a.kreirano_at ? new Date(a.kreirano_at) : new Date(0);
            const dateB = b.kreirano_at ? new Date(b.kreirano_at) : new Date(0);
            return dateB.getTime() - dateA.getTime();
          });
          break;
      }

      return result;
    });

    // Reset filters
    const resetFilters = () => {
      emit("reset-filters");
    };

    // Modal handling
    const handleQuickView = (product: Product) => {
      selectedProduct.value = product;
      showQuickViewModal.value = true;
    };

    const closeQuickViewModal = () => {
      showQuickViewModal.value = false;
      selectedProduct.value = null;
    };

    // Load products
    const loadProducts = async () => {
      if (products.value.length === 0) {
        await productStore.fetchProducts();
      }
    };

    // Load categories if needed
    const loadCategories = async () => {
      if (categoryStore.categories.length === 0) {
        await categoryStore.fetchCategories();
      }
    };

    loadProducts();
    loadCategories();

    return {
      filteredProducts,
      loading,
      showQuickViewModal,
      selectedProduct,
      handleQuickView,
      closeQuickViewModal,
      resetFilters,
    };
  },
};
</script>

<style scoped>
.products-section {
  width: 100%;
  position: relative;
  min-height: 200px;
}

.products-container {
  display: grid;
  gap: 1.5rem;
}

.products-container.grid {
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}

.products-container.list {
  grid-template-columns: 1fr;
}

.no-products {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 1rem;
  text-align: center;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.no-products-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  max-width: 400px;
}

.no-products-message i {
  font-size: 3rem;
  color: #9ca3af;
}

.no-products-message h3 {
  font-size: 1.5rem;
  color: #1f2937;
  margin: 0;
}

.no-products-message p {
  color: #6b7280;
  margin: 0;
}

.reset-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.reset-button:hover {
  background: #4f46e5;
}

/* Loading styles */
.loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.8);
  gap: 1rem;
  padding: 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(99, 102, 241, 0.1);
  border-radius: 50%;
  border-top-color: #6366f1;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .products-container.grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .products-container.grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 0.75rem;
  }
}
</style>