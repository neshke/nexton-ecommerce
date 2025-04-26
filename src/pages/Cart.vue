<template>
  <div class="cart-page">
    <Header title="Vaša" highlighted="Korpa" subtitle="Pregledajte artikle i završite kupovinu" />

    <main class="main-content">
      <div class="container">
        <div v-if="loading" class="loading">Učitavanje vaše korpe...</div>

        <div v-else-if="isCartEmpty" class="empty-cart">
          <div class="empty-content card animate-fade-in">
            <i class="fas fa-shopping-cart empty-icon"></i>
            <h2>Vaša korpa je prazna</h2>
            <p>Još uvek niste dodali nijedan proizvod.</p>
            <router-link to="/products" class="btn primary">Nastavi kupovinu</router-link>
          </div>
        </div>

        <div v-else class="cart-container animate-fade-in">
          <h2 class="title">Korpa za kupovinu ({{ itemCount }} artikla)</h2>

          <div class="cart-grid">
            <div class="cart-items">
              <div v-for="item in cartItems" :key="item.id" class="cart-item">
                <div class="item-image">
                  <img :src="item.product.slika_url || placeholder" :alt="item.product.naziv"
                    @error="handleImageError" />
                </div>

                <div class="item-details">
                  <h3>{{ item.product.naziv }}</h3>
                  <p class="desc">{{ truncate(item.product.opis) }}</p>
                  <p class="price">{{ formatPrice(item.product.cena) }} po komadu</p>

                  <div class="item-actions">
                    <div class="quantity">
                      <button @click="decreaseQuantity(item.id, item.quantity)"
                        :disabled="item.quantity <= 1">-</button>
                      <span>{{ item.quantity }}</span>
                      <button @click="increaseQuantity(item.id)">+</button>
                    </div>

                    <button class="remove" @click="removeItem(item.id)">
                      <i class="fas fa-trash"></i> Ukloni
                    </button>
                  </div>
                </div>

                <div class="item-subtotal">
                  <span>Međuzbir:</span>
                  <span class="amount">{{ formatPrice(item.product.cena * item.quantity) }}</span>
                </div>
              </div>
            </div>

            <div class="summary">
              <div class="summary-card">
                <h3>Pregled porudžbine</h3>

                <div class="summary-row">
                  <span>Međuzbir</span>
                  <span>{{ formatPrice(total) }}</span>
                </div>

                <div class="summary-row">
                  <span>Dostava</span>
                  <span>Besplatno</span>
                </div>

                <div class="summary-row total">
                  <span>Ukupno</span>
                  <span>{{ formatPrice(finalTotal) }}</span>
                </div>
                <button class="btn primary full" @click="proceedToCheckout">Nastavi na plaćanje</button>
                <router-link to="/products" class="continue">Nastavi kupovinu</router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { useNotification } from "@/utils/notifications";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import { PLACEHOLDER_IMAGE } from "@/utils/constants";

export default {
  name: "Cart",
  components: {
    Header,
    Footer
  },
  setup() {
    const router = useRouter();
    const cartStore = useCartStore();
    const authStore = useAuthStore();
    const { showNotification } = useNotification();

    // Stanje za učitavanje
    const loading = ref(false);
    const placeholder = ref(PLACEHOLDER_IMAGE);

    // Podaci za prikaz korpe
    const cartItems = computed(() => cartStore.cartItems);
    const total = computed(() => cartStore.cartTotal);
    const itemCount = computed(() => cartStore.itemCount);

    // Praćenje šifre za popust
    const discountCode = ref("");
    const discountApplied = ref(false);
    const discountAmount = ref(0);

    // Računanje konačnog iznosa (sa mogućim popustom)
    const finalTotal = computed(() => {
      if (discountApplied.value) {
        return total.value - discountAmount.value;
      }
      return total.value;
    });

    // Prikaži praznu korpu
    const isCartEmpty = computed(() => cartItems.value.length === 0);

    // Funkcija za skraćivanje teksta
    const truncate = (text: string | undefined, maxLength: number = 100): string => {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    };

    // Funkcija koja se poziva kada slika proizvoda ne može da se učita
    const handleImageError = (event: Event) => {
      const target = event.target as HTMLImageElement;
      target.src = PLACEHOLDER_IMAGE;
    };

    // Funkcija za formatiranje cene
    const formatPrice = (price: number): string => {
      return new Intl.NumberFormat("sr-RS", {
        style: "currency",
        currency: "EUR",
      }).format(price);
    };

    // Funkcija za povećavanje količine proizvoda
    const increaseQuantity = (productId: number) => {
      cartStore.updateItemQuantity(productId, 1); // +1
    };

    // Funkcija za smanjenje količine proizvoda
    const decreaseQuantity = (productId: number, currentQuantity: number) => {
      if (currentQuantity > 1) {
        cartStore.updateItemQuantity(productId, -1); // -1
      } else {
        removeItem(productId);
      }
    };

    // Funkcija za uklanjanje proizvoda iz korpe
    const removeItem = (productId: number) => {
      cartStore.removeItem(productId);
      showNotification("Proizvod uklonjen iz korpe", "success");
    };

    // Funkcija za primenu šifre za popust
    const applyDiscount = () => {
      // Jednostavna validacija šifre (u stvarnoj aplikaciji ovo bi proveravalo backend)
      if (discountCode.value.toLowerCase() === "popust10") {
        const discount = total.value * 0.1; // 10% popusta
        discountAmount.value = discount;
        discountApplied.value = true;
        showNotification("Popust od 10% uspešno primenjen!", "success");
      } else if (discountCode.value.toLowerCase() === "popust20") {
        const discount = total.value * 0.2; // 20% popusta
        discountAmount.value = discount;
        discountApplied.value = true;
        showNotification("Popust od 20% uspešno primenjen!", "success");
      } else {
        showNotification("Nevažeća šifra za popust", "error");
      }
    };

    // Funkcija za uklanjanje popusta
    const removeDiscount = () => {
      discountCode.value = "";
      discountApplied.value = false;
      discountAmount.value = 0;
    };

    // Funkcija za prelazak na naplatu
    const proceedToCheckout = () => {
      if (authStore.isAuthenticated) {
        router.push("/checkout");
      } else {
        showNotification("Morate se prijaviti pre naplate", "error");
        router.push({
          path: "/login",
          query: { redirect: "/checkout" }
        });
      }
    };

    // Funkcija za nastavak kupovine
    const continueShopping = () => {
      router.push("/products");
    };

    return {
      loading,
      placeholder,
      cartItems,
      total,
      itemCount,
      discountCode,
      discountApplied,
      discountAmount,
      finalTotal,
      isCartEmpty,
      truncate,
      handleImageError,
      formatPrice,
      increaseQuantity,
      decreaseQuantity,
      removeItem,
      applyDiscount,
      removeDiscount,
      proceedToCheckout,
      continueShopping
    };
  }
}
</script>

<style scoped>
@import "../assets/styles/shared.css";

/* Layout */
.cart-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 4rem 0;
  background: #f8f9fa;
}

.container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.title {
  font-size: 2rem;
  color: #2d3748;
  margin-bottom: 2rem;
  font-weight: 700;
}

/* Grid layout */
.cart-grid {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
}

/* Cart items */
.cart-items {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.cart-item {
  display: grid;
  grid-template-columns: 150px 1fr auto;
  gap: 1.5rem;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.cart-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

/* Product image */
.item-image {
  width: 100%;
  height: 150px;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.item-image:hover img {
  transform: scale(1.05);
}

/* Product details */
.item-details {
  display: flex;
  flex-direction: column;
}

.item-details h3 {
  margin: 0 0 0.5rem;
  font-size: 1.2rem;
  color: #2d3748;
}

.desc {
  color: #4a5568;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  flex-grow: 1;
}

.price {
  font-weight: 600;
  color: #6366f1;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

/* Item actions */
.item-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: auto;
}

.quantity {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.quantity button {
  width: 36px;
  height: 36px;
  border: 2px solid #6366f1;
  background: white;
  color: #6366f1;
  font-size: 1.2rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quantity button:hover:not(:disabled) {
  background: #6366f1;
  color: white;
}

.quantity span {
  font-size: 1.1rem;
  font-weight: 600;
  min-width: 2rem;
  text-align: center;
}

.remove {
  padding: 0.5rem 1rem;
  background: transparent;
  color: #ef4444;
  border: 1px solid #ef4444;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.remove:hover {
  background: #ef4444;
  color: white;
}

.item-subtotal {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
}

.item-subtotal .amount {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2d3748;
  margin-top: 0.5rem;
}

/* Cart summary */
.summary {
  position: sticky;
  top: 2rem;
}

.summary-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.summary-card h3 {
  margin: 0 0 1.5rem;
  font-size: 1.5rem;
  color: #2d3748;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.summary-row.total {
  margin-top: 1rem;
  border-top: 1px solid #e2e8f0;
  padding-top: 1rem;
  font-size: 1.2rem;
  font-weight: 700;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  border: none;
}

.btn.primary {
  background: #6366f1;
  color: white;
}

.btn.primary:hover {
  background: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(99, 102, 241, 0.2);
}

.btn.full {
  width: 100%;
  margin-top: 1.5rem;
  padding: 1rem;
  font-size: 1.1rem;
}

.continue {
  display: block;
  text-align: center;
  margin-top: 1rem;
  color: #6366f1;
  text-decoration: none;
}

.continue:hover {
  text-decoration: underline;
}

/* Empty cart */
.empty-cart {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.empty-content {
  text-align: center;
  padding: 3rem;
  max-width: 500px;
}

.empty-content p {
  margin-bottom: 1.5rem;
  /* Add space between paragraph and button */
}

.empty-icon {
  font-size: 4rem;
  color: #6366f1;
  margin-bottom: 1rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #6b7280;
}

/* Responsive */
@media (max-width: 1024px) {
  .cart-grid {
    grid-template-columns: 1fr;
  }

  .summary {
    position: static;
  }
}

@media (max-width: 768px) {
  .cart-item {
    grid-template-columns: 1fr;
  }

  .item-image {
    height: 200px;
    max-width: 200px;
    margin: 0 auto;
  }

  .item-subtotal {
    flex-direction: row;
    justify-content: space-between;
    margin-top: 1rem;
  }

  .main-content {
    padding: 2rem 0;
  }

  .container {
    padding: 0 1rem;
  }
}
</style>
