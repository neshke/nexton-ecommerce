<template>
  <div class="products-page">
    <main class="main-content">
      <header class="hero animate-fade-in">
        <div class="hero-content">
          <h1 class="animate-slide-down">Our <span class="highlight">Products</span></h1>
          <p class="animate-slide-up">Discover amazing products curated just for you</p>
        </div>
      </header>

      <section class="products-section animate-fade-in">
        <div class="container">
          <div v-if="loading" class="loading">Loading products...</div>
          <div v-else-if="error" class="error">{{ error }}</div>
          <ProductList
            v-else
            :products="products"
            @add-to-cart="handleAddToCart"
            @view-product="handleViewProduct"
          />
        </div>
      </section>

      <section class="newsletter animate-slide-up">
        <div class="newsletter-content">
          <h2>Stay Updated</h2>
          <p>Subscribe for new product alerts and exclusive offers</p>
          <form class="newsletter-form" @submit.prevent="handleSubscribe">
            <input
              v-model="email"
              type="email"
              placeholder="Enter your email"
              required
            />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </section>
    </main>
    <div
      v-if="notification?.message"
      class="notification"
      :class="notification.type"
    >
      {{ notification.message }}
    </div>
    <ProductDetailsModal
      :show="showProductModal"
      :product="selectedProduct"
      @close="closeProductModal"
      @add-to-cart="handleAddToCart"
    />
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useProductStore } from "@/stores/productStore";
import { useNotification } from "@/utils/notifications";
import ProductList from "@/components/Products/ProductList.vue";
import ProductDetailsModal from '@/components/Products/ProductDetailsModal.vue';
import Footer from '@/components/Footer.vue';
import type { Product } from "@/types";

const store = useProductStore();
const { notification, showNotification } = useNotification();
const email = ref("");
const products = ref<Product[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const showProductModal = ref(false);
const selectedProduct = ref<Product | null>(null);

onMounted(async () => {
  try {
    loading.value = true;
    await store.fetchProducts();
    products.value = store.getProducts;
  } catch (err) {
    error.value = "Failed to load products";
    console.error("Failed to fetch products:", err);
  } finally {
    loading.value = false;
  }
});

const handleAddToCart = ({ product, quantity }: { product: Product; quantity: number }) => {
  if (!product) return;

  try {
    store.addToCart({ product, quantity });
    showNotification("Product added to cart", "success");
  } catch (error) {
    showNotification("Failed to add product to cart", "error");
  }
};

const handleSubscribe = async () => {
  try {
    showNotification("Thank you for subscribing!", "success");
    email.value = "";
  } catch (error) {
    showNotification("Failed to subscribe", "error");
  }
};

const handleViewProduct = (product: Product) => {
  selectedProduct.value = product;
  showProductModal.value = true;
};

const closeProductModal = () => {
  showProductModal.value = false;
  selectedProduct.value = null;
};

</script>

<style scoped>
.products-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
  width: 100%;
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
  padding: 4rem 2rem;
  background: #f8f9fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.newsletter {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  padding: 4rem 2rem;
  color: white;
  text-align: center;
}

.newsletter-content {
  max-width: 600px;
  margin: 0 auto;
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

@media (max-width: 768px) {
  .newsletter-form {
    flex-direction: column;
  }

  .newsletter-form button {
    width: 100%;
  }
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
</style>
