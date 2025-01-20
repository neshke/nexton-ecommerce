<template>
  <div class="home">
    <main class="main-content">
      <header class="hero animate-fade-in">
        <div class="hero-content">
          <h1>Welcome to our <span class="highlight">eCommerce Store</span></h1>
          <p>Discover amazing products curated just for you</p>
          <div class="hero-buttons">
            <button class="hero-btn primary" @click="$router.push('/products')">
              Shop Now
            </button>
            <button class="hero-btn secondary" @click="$router.push('/login')">
              Get Started
            </button>
          </div>
        </div>
      </header>
      <section class="sales-window animate-slide-up">
        <h2>Featured Products</h2>
        <div v-if="loading" class="loading">Loading featured products...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <div v-else-if="featuredProducts.length" class="sales-items">
          <div
            v-for="product in featuredProducts"
            :key="product.id"
            class="sales-item"
          >
            <img
              :src="product.image_url || '/placeholder.jpg'"
              :alt="product.name"
              @error="handleImageError"
              class="product-image"
            />
            <div class="sales-info">
              <h3>{{ product.name }}</h3>
              <p class="price">${{ formatPrice(product.price) }}</p>
              <button @click="viewProduct(product.id)" class="view-btn">
                View Details
              </button>
            </div>
          </div>
        </div>
        <div v-else class="no-products">No featured products available</div>
      </section>
      <section class="features">
        <h2 class="animate-fade-in">Why Choose Us</h2>
        <div class="feature-items">
          <div
            v-for="(feature, index) in features"
            :key="feature.id"
            class="feature-item animate-slide-up"
            :style="{ animationDelay: `${index * 0.2}s` }"
          >
            <i :class="`fas fa-${feature.icon} feature-icon`"></i>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </section>
      <section class="testimonials">
        <h2 class="animate-fade-in">What Our Customers Say</h2>
        <div class="testimonial-items">
          <div
            v-for="(testimonial, index) in testimonials"
            :key="index"
            class="testimonial-item animate-scale-in"
            :style="{ animationDelay: `${index * 0.3}s` }"
          >
            <div class="quote-icon">"</div>
            <p>Great products and amazing service!</p>
            <div class="testimonial-author">
              <img
                :src="PLACEHOLDER_IMAGE"
                alt="Jane Doe"
                class="author-image"
                @error="handleImageError"
              />
              <span>Jane Doe</span>
            </div>
          </div>
          <div
            class="testimonial-item animate-scale-in"
            :style="{ animationDelay: `0.3s` }"
          >
            <div class="quote-icon">"</div>
            <p>I love shopping here. Highly recommend!</p>
            <div class="testimonial-author">
              <img
                :src="PLACEHOLDER_IMAGE"
                alt="John Smith"
                class="author-image"
                @error="handleImageError"
              />
              <span>John Smith</span>
            </div>
          </div>
        </div>
      </section>
      <section class="newsletter animate-fade-in">
        <div class="newsletter-content">
          <h2>Stay Updated</h2>
          <p>Subscribe to our newsletter for exclusive offers and updates</p>
          <form class="newsletter-form">
            <input type="email" placeholder="Enter your email" />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </section>
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useProductStore } from "@/stores/productStore";
import { FEATURES, TESTIMONIALS } from "@/constants/home";
import { PLACEHOLDER_IMAGE } from "@/utils/constants";
import Footer from "@/components/Footer.vue";
import type { Product } from "@/types";

const router = useRouter();
const store = useProductStore();
const featuredProducts = ref<Product[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const features = ref(FEATURES);

onMounted(async () => {
  try {
    loading.value = true;
    await store.fetchProducts();
    featuredProducts.value = store.getProducts.slice(0, 4).map((product) => ({
      ...product,
      image_url: product.image_url || PLACEHOLDER_IMAGE,
    }));
  } catch (err) {
    error.value = "Failed to load featured products";
    console.error("Failed to fetch products:", err);
  } finally {
    loading.value = false;
  }
});

const formatPrice = (price: number | string): string => {
  if (typeof price === "string") {
    price = parseFloat(price);
  }
  if (typeof price !== "number" || isNaN(price)) {
    return "0.00";
  }
  return price.toFixed(2);
};

const viewProduct = (id: number) => {
  router.push(`/product/${id}`);
};

const isPlaceholder = (url: string | null): boolean => {
  return !url || url === PLACEHOLDER_IMAGE;
};

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  if (!isPlaceholder(img.src)) {
    img.src = PLACEHOLDER_IMAGE;
  }
};

const testimonials = ref(
  TESTIMONIALS.map((testimonial) => ({
    ...testimonial,
    avatar: PLACEHOLDER_IMAGE,
  }))
);
</script>

<style scoped>
.home {
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
  padding: clamp(3rem, 8vw, 6rem) 1rem;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  margin: 0;
  color: white;
  text-align: center;
}

.hero-content {
  max-width: min(800px, 90%);
  margin: 0 auto;
}

.hero h1 {
  font-size: clamp(2rem, 5vw, 3.5rem);
  margin-bottom: 1rem;
  font-weight: 700;
  line-height: 1.2;
  animation: slideInRight 1s ease-out;
}

.highlight {
  color: #ffd700;
}

.hero p {
  font-size: clamp(1rem, 3vw, 1.4rem);
  margin-bottom: 2rem;
  opacity: 0.9;
  animation: slideInLeft 1s ease-out 0.3s backwards;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.hero-btn {
  padding: 1rem 2.5rem;
  font-size: clamp(0.9rem, 2vw, 1.1rem);
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  min-width: 160px;
}

.hero-btn.primary {
  background-color: white;
  color: #6366f1;
}

.hero-btn.secondary {
  background-color: transparent;
  border: 2px solid white;
  color: white;
}

.hero-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.hero-btn.primary:hover {
  background-color: #f8f9fa;
}

.hero-btn.secondary:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.features {
  padding: 4rem 2rem;
  background: #f8f9fa;
}

.features h2 {
  font-size: 2.5em;
  text-align: center;
  margin-bottom: 3rem;
  color: #2d3748;
}

.feature-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  padding: 0 1rem;
}

.feature-item {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  transition: transform 0.3s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature-item:hover {
  transform: translateY(-10px) scale(1.03);
  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.1);
}

.feature-icon {
  font-size: 2.5em;
  color: #6366f1;
  margin-bottom: 1rem;
  transition: transform 0.3s ease;
}

.feature-item:hover .feature-icon {
  transform: scale(1.2) rotate(360deg);
}

.testimonials {
  padding: 4rem 2rem;
}

.testimonial-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
}

.testimonial-item {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  position: relative;
  transition: transform 0.3s;
}

.testimonial-item:hover {
  transform: translateY(-5px);
}

.quote-icon {
  font-size: 4em;
  color: #6366f1;
  opacity: 0.1;
  position: absolute;
  top: 10px;
  left: 10px;
}

.testimonial-author {
  display: flex;
  align-items: center;
  margin-top: 1rem;
}

.author-image {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 1rem;
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
  padding: 0 clamp(1rem, 3vw, 2rem);
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
  transition: transform 0.2s;
}

.newsletter-form button:hover {
  transform: translateY(-2px);
}

.footer {
  margin-top: auto;
  padding: 2rem;
  background-color: #2d3748;
  color: white;
  text-align: center;
}

.sales-window {
  padding: 4rem 2rem;
  background: white;
}

.sales-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: clamp(1rem, 3vw, 2rem);
  padding: clamp(1rem, 3vw, 2rem);
  max-width: 1200px;
  margin: 0 auto;
}

.sales-item {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  transition: transform 0.3s, box-shadow 0.3s;
}

.sales-item:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.sales-item img {
  width: 100%;
  height: 200px;
  object-fit: contain; /* Changed from cover to contain */
  transition: transform 0.5s ease;
}

.sales-item:hover img {
  transform: scale(1.1);
}

.sales-info {
  padding: 1.5rem;
  text-align: center;
}

.sales-info h3 {
  margin-bottom: 0.5rem;
  color: #2d3748;
}

.price {
  font-size: 1.25rem;
  font-weight: bold;
  color: #6366f1;
  margin: 0.5rem 0;
}

.view-btn {
  width: 100%;
  padding: 0.8rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.view-btn:hover {
  background: #4f46e5;
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 2.5em;
  }

  .newsletter-form {
    flex-direction: column;
  }

  .newsletter-form button {
    width: 100%;
  }

  .sales-items {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

.loading,
.error,
.no-products {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error {
  color: #dc2626;
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: contain; /* Changed from cover to contain */
  background: #f3f4f6;
}

.sales-window h2 {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #2d3748;
}

/* Base Animation Classes */
.animate-fade-in {
  animation: fadeIn 1s ease-out forwards;
  opacity: 0;
}

.animate-slide-up {
  animation: slideUp 0.8s ease-out forwards;
  opacity: 0;
}

.animate-scale-in {
  animation: scaleIn 0.6s ease-out forwards;
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

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.1);
  }
  80% {
    opacity: 1;
    transform: scale(0.89);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Ensure animations play when elements enter viewport */
@media (prefers-reduced-motion: no-preference) {
  .animate-fade-in,
  .animate-slide-up,
  .animate-scale-in {
    will-change: transform, opacity;
  }
}

.login-button {
  display: inline-block;
  padding: 15px 40px;
  background-color: #ffffff;
  color: #2c3e50;
  text-decoration: none;
  border-radius: 5px;
  font-weight: bold;
  font-size: 1.1em;
  transition: all 0.3s ease;
}

.login-button:hover {
  background-color: #2c3e50;
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .hero h1 {
    font-size: 2em;
  }

  .hero p {
    font-size: 1em;
  }

  .login-button {
    padding: 12px 30px;
    font-size: 1em;
  }

  .hero-buttons {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .hero-btn {
    width: 100%;
    max-width: 300px;
  }

  .newsletter-form {
    flex-direction: column;
  }

  .newsletter-form button {
    width: 100%;
  }

  .feature-items {
    grid-template-columns: 1fr;
    padding: 1rem;
  }

  .sales-items {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }

  .testimonial-items {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .hero {
    padding: 3rem 1rem;
  }

  .hero-content {
    max-width: 100%;
  }

  .sales-items {
    grid-template-columns: 1fr;
  }
}

/* Optimize animations for better performance */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in,
  .animate-slide-up,
  .animate-scale-in,
  .hero h1,
  .hero p,
  .hero-btn {
    animation: none;
  }
}

@media (max-width: 1024px) {
  .hero {
    padding: clamp(2rem, 6vw, 4rem) 1rem;
  }

  .feature-items {
    grid-template-columns: repeat(2, 1fr);
  }

  .sales-items {
    padding: 1rem;
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .hero-content {
    padding: 0 1rem;
  }

  .hero h1 {
    font-size: clamp(1.8rem, 4vw, 2.5rem);
  }

  .feature-items {
    grid-template-columns: 1fr;
  }

  .testimonial-items {
    grid-template-columns: 1fr;
    padding: 1rem;
  }

  .newsletter-content {
    padding: 0 1rem;
  }
}

@media (max-width: 480px) {
  .hero {
    padding: 2rem 1rem;
  }

  .sales-items {
    grid-template-columns: 1fr;
  }

  .feature-item {
    padding: 1.5rem;
  }

  .newsletter-form {
    gap: 0.5rem;
  }
}
</style>
