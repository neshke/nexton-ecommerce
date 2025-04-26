<template>
  <div class="products-page">
    <main class="main-content">
      <Header title="Naši" highlighted="Proizvodi" subtitle="Otkrijte neverovatne proizvode pažljivo odabrane za vas" />

      <section class="products-section animate-fade-in">
        <div class="container">
          <div class="products-header">
            <ProductsMenu :initialSort="sortOption" :initialView="viewMode" :categories="categories"
              @sort-change="handleSortChange" @view-change="handleViewChange" @filter-change="handleFilterChange" />
          </div>

          <template v-if="loading">
            <div class="loading">Loading products...</div>
          </template>
          <template v-else-if="error">
            <div class="error">{{ error }}</div>
          </template>
          <template v-else>
            <div v-if="filteredProducts.length === 0" class="no-products">
              Nema proizvoda koji odgovaraju vašim filterima.
              <button @click="resetFilters" class="reset-btn">
                Resetuj filtere
              </button>
            </div>
            <ProductList v-else :key="viewMode" :products="filteredProducts" :viewMode="viewMode" :isAdmin="isAdmin"
              @add-to-cart="handleAddToCart" @view-product="handleViewProduct"
              @add-product="showAddProductModal = true" />
          </template>
        </div>
      </section>

      <section class="newsletter animate-slide-up">
        <div class="newsletter-content">
          <h2>Budite u toku</h2>
          <p>Prijavite se za obaveštenja o novim proizvodima i ekskluzivnim ponudama</p>
          <form class="newsletter-form" @submit.prevent="handleSubscribe">
            <input v-model="email" type="email" placeholder="Unesite vaš email" required />
            <button type="submit">Prijavi se</button>
          </form>
        </div>
      </section>
    </main>

    <ProductDetailsModal :show="showProductModal" :product="selectedProduct" @close="closeProductModal"
      @add-to-cart="handleAddToCart" />

    <ProductFormModal :show="showAddProductModal" :categories="categories" @close="closeAddProductModal"
      @save="handleAddProduct" />

    <Footer />
  </div>
</template>

<script lang="ts">
import { ref, onBeforeMount, computed } from "vue";
import { useProductStore } from "@/stores/productStore";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { useNotification } from "@/utils/notifications";
import type { Product, Category } from "@/models";
import ProductList from "@/components/Products/ProductList.vue";
import ProductsMenu from "@/components/Products/ProductsMenu.vue";
import ProductDetailsModal from "@/components/Products/ProductDetailsModal.vue";
import ProductFormModal from "@/components/Products/ProductFormModal.vue";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";

export default {
  name: "Products",
  components: {
    ProductList,
    ProductsMenu,
    Header,
    Footer,
    ProductDetailsModal,
    ProductFormModal
  },
  setup() {
    const productStore = useProductStore();
    const cartStore = useCartStore();
    const authStore = useAuthStore();
    const { showNotification } = useNotification();

    // State references
    const loading = ref(false);
    const error = ref<string | null>(null);
    const viewMode = ref("grid");
    const sortOption = ref("name-asc");
    const email = ref("");
    const selectedProduct = ref<Product | null>(null);
    const showProductModal = ref(false);
    const showAddProductModal = ref(false);

    // Filters
    const filters = ref({
      searchTerm: "",
      categoryId: null as number | null,
      minPrice: null as number | null,
      maxPrice: null as number | null,
      sortBy: "name-asc"
    });

    // Computed properties
    const categories = computed(() => {
      // Extract unique categories from products
      const uniqueCategories = new Map<number, Category>();

      productStore.products.forEach(product => {
        if (product.kategorija_id && product.category) {
          uniqueCategories.set(product.kategorija_id, {
            id: product.kategorija_id,
            naziv: product.category.naziv || `Kategorija ${product.kategorija_id}`,
            url_slug: product.category.url_slug || '',
            opis: product.category.opis || '',
            aktivan: product.category.aktivan !== undefined ? product.category.aktivan : true
          });
        }
      });

      return Array.from(uniqueCategories.values());
    });


    // Filtered products based on filters
    const filteredProducts = computed(() => {
      let filtered = productStore.getProducts

      // Search by name or description
      if (filters.value.searchTerm) {
        const searchTerm = filters.value.searchTerm.toLowerCase();
        filtered = filtered.filter(
          product =>
            (product.naziv ? product.naziv.toLowerCase().includes(searchTerm) : false) ||
            (product.opis ? product.opis.toLowerCase().includes(searchTerm) : false)
        );
      }

      // Filter by category
      if (filters.value.categoryId) {
        filtered = filtered.filter(
          product => product.kategorija_id === filters.value.categoryId
        );
      }

      // Filter by min price
      if (filters.value.minPrice !== null) {
        filtered = filtered.filter(
          product => (product.cena || 0) >= (filters.value.minPrice || 0)
        );
      }

      // Filter by max price
      if (filters.value.maxPrice !== null) {
        filtered = filtered.filter(
          product => (product.cena || 0) <= (filters.value.maxPrice || 0)
        );
      }

      // Sort products
      switch (filters.value.sortBy) {
        case "name-asc":
          filtered.sort((a, b) => (a.naziv || '').localeCompare(b.naziv || ''));
          break;
        case "name-desc":
          filtered.sort((a, b) => (b.naziv || '').localeCompare(a.naziv || ''));
          break;
        case "price-asc":
          filtered.sort((a, b) => (a.cena || 0) - (b.cena || 0));
          break;
        case "price-desc":
          filtered.sort((a, b) => (b.cena || 0) - (a.cena || 0));
          break;
      }

      // Return filtered products without any image processing
      return filtered;
    });

    // Initialization
    onBeforeMount(async () => {
      loading.value = true;
      try {
        console.log("Fetching products and categories...");
        await productStore.fetchProducts();
      } catch (err) {
        console.error("Error loading products or categories:", err);
        error.value = "Došlo je do greške pri učitavanju proizvoda.";
      } finally {
        loading.value = false;
      }
    });

    // Event handlers
    const handleSortChange = (option: string) => {
      sortOption.value = option;
      filters.value.sortBy = option;
    };

    const handleViewChange = (mode: string) => {
      viewMode.value = mode;
    };

    const handleFilterChange = (newFilters: any) => {
      filters.value = { ...filters.value, ...newFilters };
    };

    const resetFilters = () => {
      filters.value = {
        searchTerm: "",
        categoryId: null,
        minPrice: null,
        maxPrice: null,
        sortBy: "name-asc"
      };
      sortOption.value = "name-asc";
    };

    const handleAddToCart = ({ product, quantity = 1 }: { product: Product; quantity?: number }) => {
      if (!product || !product.id) {
        console.error("Attempted to add invalid product to cart:", product);
        return;
      }

      cartStore.addToCart({ product, quantity });
      // Notification is now handled inside the cartStore
    };

    const handleViewProduct = (product: Product) => {
      selectedProduct.value = product;
      showProductModal.value = true;
    };

    const closeProductModal = () => {
      showProductModal.value = false;
      selectedProduct.value = null;
    };

    const closeAddProductModal = () => {
      showAddProductModal.value = false;
    };

    const handleSubscribe = async () => {
      if (!email.value) return;

      try {
        // Newsletter subscription logic would go here
        showNotification("Uspešno ste se prijavili na newsletter!", "success");
        email.value = "";
      } catch (err) {
        showNotification("Došlo je do greške pri prijavi na newsletter.", "error");
      }
    };

    const handleAddProduct = async (productData: any) => {
      try {
        console.log("Adding product:", productData);
        await productStore.createProduct(productData);
        await productStore.fetchProducts();
        showNotification("Proizvod uspešno dodat!", "success");
        closeAddProductModal();
      } catch (err) {
        showNotification("Došlo je do greške pri dodavanju proizvoda.", "error");
      }
    };

    return {
      loading,
      error,
      viewMode,
      filters,
      filteredProducts,
      isAdmin: authStore.isAdmin,
      categories,
      sortOption,
      email,
      selectedProduct,
      showProductModal,
      showAddProductModal,
      handleSortChange,
      handleViewChange,
      handleFilterChange,
      resetFilters,
      handleAddToCart,
      handleViewProduct,
      closeProductModal,
      closeAddProductModal,
      handleSubscribe,
      handleAddProduct
    };
  }
}
</script>

<style scoped>
.products-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  width: 100%;
  padding: 0;
}

.hero {
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  margin: 0;
  color: white;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero h1 {
  font-size: 3em;
  margin-bottom: 1rem;
  font-weight: 700;
}

.highlight {
  color: #ffd700;
}

.products-section {
  padding: 4rem 0;
  background: #f8f9fa;
  width: 100%;
}

.container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.newsletter {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  padding: 4rem 2rem;
  color: white;
  text-align: center;
}

.newsletter-content {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

.newsletter-form {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.newsletter-form input {
  flex: 1;
  padding: 1rem;
  font-size: 1em;
  border: none;
  border-radius: 30px;
}

.newsletter-form button {
  padding: 1rem 2rem;
  font-size: 1em;
  background-color: #ffd700;
  color: #2d3748;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.newsletter-form button:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 15px rgba(255, 215, 0, 0.2);
}

.loading {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #666;
}

.error {
  color: #dc2626;
  text-align: center;
  padding: 2rem;
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

/* Animation Classes */
.animate-fade-in {
  animation: fadeIn 1s ease-out forwards;
}

.animate-slide-down {
  animation: slideDown 1s ease-out forwards;
}

.animate-slide-up {
  animation: slideUp 1s ease-out 0.3s backwards;
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

@keyframes slideDown {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.no-products {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.reset-btn {
  margin-left: 0.5rem;
  padding: 0.4rem 0.8rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.reset-btn:hover {
  background: #4f46e5;
}

.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

/* Responsive styles */
@media (max-width: 1200px) {
  .container {
    padding: 0 1.5rem;
  }
}

@media (max-width: 992px) {
  .products-header {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 2.5em;
  }

  .products-section {
    padding: 2rem 0;
  }

  .container {
    padding: 0 1rem;
  }

  .newsletter {
    padding: 3rem 1rem;
  }

  .newsletter-content {
    padding: 0 1rem;
  }

  .newsletter-form {
    flex-direction: column;
  }

  .newsletter-form input,
  .newsletter-form button {
    width: 100%;
    box-sizing: border-box;
  }

  .newsletter-form button {
    padding: 0.8rem;
  }

  .no-products {
    padding: 2rem 1rem;
  }
}

@media (max-width: 480px) {
  .hero h1 {
    font-size: 2em;
  }

  .reset-btn {
    margin-left: 0;
    margin-top: 0.5rem;
    display: inline-block;
  }

  .no-products {
    flex-direction: column;
    text-align: center;
  }
}
</style>
