<template>
  <div class="products-page-wrapper">
    <div class="products-page-content">
      <div v-if="authStore.isAdmin" class="admin-actions-header">
        <button class="add-product-button-header" @click="openProductFormModal">
          <i class="fas fa-plus"></i> Dodaj novi proizvod
        </button>
      </div>
      <ProductsMenu @filters-changed="applyFilters" @sort-changed="applySort" @search-changed="applySearch"
        @view-change="updateViewMode" />
      <div class="product-grid-container">
        <div v-if="loading || categoryLoading" class="loading-state">
          <p>Učitavanje podataka...</p>
        </div>
        <div v-else-if="error || categoryError" class="error-state">
          <p>{{ error || categoryError }}</p>
        </div>
        <div v-else-if="paginatedProducts.length === 0" class="empty-state">
          <p>Nema proizvoda koji odgovaraju vašim filterima.</p>
        </div>
        <ProductList v-else :products="paginatedProducts" :view-mode="viewMode" @view-product="showProductDetailsModal"
          @product-deleted="handleProductDeleted" />
      </div>
      <div class="pagination-controls">
        <button @click="prevPage" :disabled="currentPage === 1">Prethodna</button>
        <span>Stranica {{ currentPage }} od {{ totalPages }}</span>
        <button @click="nextPage" :disabled="currentPage === totalPages">Sledeća</button>
      </div>
    </div>
    <Footer />
    <ProductDetailsModal :show="!!selectedProductForModal" :product="selectedProductForModal"
      @close="closeProductDetailsModal" />
    <ProductFormModal :show="isProductFormModalVisible" @close="closeProductFormModal" @save="handleProductSaved" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useProductStore } from '@/stores/productStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useAuthStore } from '@/stores/authStore';
import ProductList from '@/components/Products/ProductList.vue';
import ProductsMenu from '@/components/Products/ProductsMenu.vue';
import Footer from "@/components/Footer.vue";
import ProductDetailsModal from '@/components/Products/ProductDetailsModal.vue';
import ProductFormModal from '@/components/Products/ProductFormModal.vue';
import type { Product, FilterOptions } from '@/models';
import { useNotification } from '@/utils/notifications';

export default defineComponent({
  name: 'ProductsPage',
  components: {
    ProductList,
    ProductsMenu,
    Footer,
    ProductDetailsModal,
    ProductFormModal
  },
  setup() {
    const productStore = useProductStore();
    const categoryStore = useCategoryStore();
    const authStore = useAuthStore();
    const { showNotification } = useNotification();

    const products = computed(() => productStore.products);
    const categories = computed(() => categoryStore.categories);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const categoryLoading = computed(() => categoryStore.loading);
    const categoryError = computed(() => categoryStore.error);

    const viewMode = ref<'grid' | 'list'>('grid');
    const selectedProductForModal = ref<Product | null>(null);
    const isProductFormModalVisible = ref(false);

    const currentFilters = ref<FilterOptions>({ categories: null, minPrice: null, maxPrice: null });
    const currentSort = ref<string>('name_asc');
    const currentSearchTerm = ref<string>('');

    const currentPage = ref(1);
    const itemsPerPage = ref(12);

    const filteredAndSortedProducts = computed(() => {
      let tempProducts = [...products.value];

      if (currentSearchTerm.value) {
        tempProducts = tempProducts.filter(product =>
          (product.naziv || '').toLowerCase().includes(currentSearchTerm.value.toLowerCase())
        );
      }

      if (currentFilters.value.categories && currentFilters.value.categories.length > 0) {
        tempProducts = tempProducts.filter(product => currentFilters.value.categories!.includes(product.kategorija_id));
      }
      if (currentFilters.value.minPrice !== null) {
        tempProducts = tempProducts.filter(product => product.cena >= currentFilters.value.minPrice!);
      }
      if (currentFilters.value.maxPrice !== null) {
        tempProducts = tempProducts.filter(product => product.cena <= currentFilters.value.maxPrice!);
      }

      switch (currentSort.value) {
        case 'price_asc':
          tempProducts.sort((a, b) => a.cena - b.cena);
          break;
        case 'price_desc':
          tempProducts.sort((a, b) => b.cena - a.cena);
          break;
        case 'name_asc':
          tempProducts.sort((a, b) => (a.naziv || '').localeCompare(b.naziv || ''));
          break;
        case 'name_desc':
          tempProducts.sort((a, b) => (b.naziv || '').localeCompare(a.naziv || ''));
          break;
      }
      return tempProducts;
    });

    /**
     * Izračunava ukupan broj stranica za paginaciju.
     */
    const totalPages = computed(() => {
      return Math.ceil(filteredAndSortedProducts.value.length / itemsPerPage.value);
    });

    /**
     * Vraća proizvode za trenutnu stranicu paginacije.
     */
    const paginatedProducts = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return filteredAndSortedProducts.value.slice(start, end);
    });

    /**
     * Asinhrono dohvata inicijalne podatke o proizvodima i kategorijama.
     * Postavlja stanje učitavanja i grešaka.
     */
    const fetchInitialData = async () => {
      loading.value = true;
      error.value = null;
      try {
        await Promise.all([
          productStore.fetchProducts(),
          categoryStore.fetchCategories()
        ]);
      } catch (err: any) {
        console.error('Error fetching initial product data:', err);
        error.value = 'Došlo je do greške pri učitavanju proizvoda.';
        showNotification(error.value, 'error');
      } finally {
        loading.value = false;
      }
    };

    /**
     * Asinhrono osvežava listu proizvoda.
     */
    const refreshProducts = async () => {
      console.log("Refreshing products list...");
      await productStore.fetchProducts();
    };

    onMounted(() => {
      fetchInitialData();
    });

    /**
     * Primenjuje izabrane filtere na listu proizvoda.
     * @param filters Opcije filtera.
     */
    const applyFilters = (filters: FilterOptions) => {
      currentFilters.value = filters;
      currentPage.value = 1;
    };

    /**
     * Primenjuje izabrani način sortiranja na listu proizvoda.
     * @param sortKey Ključ za sortiranje.
     */
    const applySort = (sortKey: string) => {
      currentSort.value = sortKey;
      currentPage.value = 1;
    };

    /**
     * Primenjuje uneti termin za pretragu na listu proizvoda.
     * @param searchTerm Termin za pretragu.
     */
    const applySearch = (searchTerm: string) => {
      currentSearchTerm.value = searchTerm;
      currentPage.value = 1;
    };

    /**
     * Prebacuje na prethodnu stranicu paginacije.
     */
    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
      }
    };

    /**
     * Prebacuje na sledeću stranicu paginacije.
     */
    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
      }
    };

    /**
     * Rukuje akcijom izmene proizvoda. (Trenutno prikazuje notifikaciju)
     * @param product Proizvod koji se menja.
     */
    const handleEditProduct = (product: Product) => {
      console.log('Editing product:', product);
      showNotification(`Funkcionalnost izmene proizvoda (${product.naziv}) još uvek nije implementirana.`, 'info');
    };

    /**
     * Asinhrono rukuje akcijom brisanja proizvoda.
     * @param product Proizvod koji se briše.
     */
    const handleDeleteProduct = async (product: Product) => {
      if (confirm(`Da li ste sigurni da želite da obrišete proizvod "${product.naziv}"?`)) {
        try {
          await productStore.deleteProduct(product.id);
          showNotification('Proizvod uspešno obrisan.', 'success');
        } catch (err) {
          console.error('Error deleting product:', err);
          showNotification('Greška pri brisanju proizvoda.', 'error');
        }
      }
    };

    /**
     * Rukuje događajem nakon brisanja proizvoda. (Trenutno samo loguje poruku)
     */
    const handleProductDeleted = async () => {
      console.log('handleProductDeleted called - this function might be redundant or needs full implementation.');
    };

    /**
     * Ažurira režim prikaza proizvoda (mreža ili lista).
     * @param newViewMode Novi režim prikaza.
     */
    const updateViewMode = (newViewMode: 'grid' | 'list') => {
      viewMode.value = newViewMode;
    };

    /**
     * Prikazuje modal sa detaljima proizvoda.
     * @param product Proizvod za prikaz.
     */
    const showProductDetailsModal = (product: Product) => {
      selectedProductForModal.value = product;
    };

    /**
     * Zatvara modal sa detaljima proizvoda.
     */
    const closeProductDetailsModal = () => {
      selectedProductForModal.value = null;
    };

    /**
     * Otvara modal za dodavanje novog proizvoda.
     */
    const openProductFormModal = () => {
      isProductFormModalVisible.value = true;
    };

    /**
     * Zatvara modal za dodavanje novog proizvoda.
     */
    const closeProductFormModal = () => {
      isProductFormModalVisible.value = false;
    };

    /**
     * Asinhrono rukuje čuvanjem (dodavanjem) novog proizvoda.
     * @param productData Podaci o novom proizvodu.
     */
    const handleProductSaved = async (productData: Partial<Product>) => {
      try {
        await productStore.createProduct(productData as Product);
        showNotification("Proizvod uspešno sačuvan!", "success");
        refreshProducts();
        closeProductFormModal();
      } catch (err) {
        console.error("Error saving product:", err);
        showNotification("Greška pri čuvanju proizvoda.", "error");
      }
    };

    return {
      products,
      categories,
      loading,
      error,
      categoryLoading,
      categoryError,
      viewMode,
      applyFilters,
      applySort,
      applySearch,
      paginatedProducts,
      currentPage,
      totalPages,
      prevPage,
      nextPage,
      authStore,
      handleEditProduct,
      handleDeleteProduct,
      handleProductDeleted,
      updateViewMode,
      selectedProductForModal,
      showProductDetailsModal,
      closeProductDetailsModal,
      refreshProducts,
      isProductFormModalVisible,
      openProductFormModal,
      closeProductFormModal,
      handleProductSaved
    };
  },
});
</script>

<style scoped>
.products-page-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.products-page-content {
  flex-grow: 1;
  /* Styles for products-page can be moved or kept here */
}

.products-page {
  display: flex;
  flex-direction: column;
  /* min-height: calc(100vh - 80px); */
  /* This might not be needed if wrapper handles min-height */
}

.product-grid-container {
  flex-grow: 1;
  padding: 1rem;
  max-width: 1400px;
  /* Max width for the content area */
  margin: 0 auto;
  /* Center the content */
  width: 100%;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  /* Ensure it takes some space */
  font-size: 1.2rem;
  color: #555;
}

.error-state p {
  color: #d32f2f;
  /* Red color for errors */
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
  padding: 1rem 0;
  /* Adjusted bottom padding */
}

.pagination-controls button {
  background-color: #6366f1;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  margin: 0 0.5rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-weight: 500;
}

.pagination-controls button:disabled {
  background-color: #a5b4fc;
  /* Lighter shade for disabled */
  cursor: not-allowed;
}

.pagination-controls button:hover:not(:disabled) {
  background-color: #4f46e5;
  /* Darker shade on hover */
}

.pagination-controls span {
  font-size: 1rem;
  color: #333;
  margin: 0 1rem;
}

/* Newsletter styles are removed as they are now in NewsletterSubscription.vue */

.admin-actions-header {
  display: flex;
  justify-content: flex-end;
  /* Default to flex-end for mobile */
  margin-bottom: 1rem;
  /* Space below the button */
  padding: 0.5rem 1rem;
  /* Padding around the button area */
  background-color: #f9fafb;
  /* Light background to differentiate */
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* Media query for desktop screens */
@media (min-width: 768px) {

  /* Adjust breakpoint as needed */
  .admin-actions-header {
    justify-content: center;
    /* Center on desktop */
  }
}

.add-product-button-header {
  padding: 0.75rem 1.5rem;
  background-color: #10b981;
  /* Green color */
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 0.9rem;
}

.add-product-button-header i {
  margin-right: 0.5rem;
}

.add-product-button-header:hover {
  background-color: #059669;
  /* Darker green on hover */
}

@media (max-width: 768px) {
  .admin-actions-header {
    padding: 0.5rem;
    margin: 0 0 0.5rem 0;
    /* Adjust margin for mobile */
  }

  .add-product-button-header {
    width: 100%;
    font-size: 0.85rem;
    padding: 0.6rem 1rem;
  }
}
</style>
