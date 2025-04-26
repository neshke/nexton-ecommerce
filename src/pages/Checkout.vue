<template>
  <div class="checkout-page">
    <Header title="Check" highlighted="Out" subtitle="Complete your order" />

    <main class="main-content">
      <div class="container">
        <div v-if="cartStore.isEmpty" class="empty-checkout animate-fade-in">
          <div class="empty-content card">
            <i class="fas fa-shopping-bag empty-icon"></i>
            <h2>Your cart is empty</h2>
            <p>Add some products to your cart before checking out.</p>
            <router-link to="/products" class="btn primary">Shop Now</router-link>
          </div>
        </div>
        <div v-else class="checkout-container animate-fade-in">
          <h2 class="title">Checkout</h2>

          <div class="checkout-grid">
            <div class="checkout-form-container">
              <form @submit.prevent="submitOrder" class="checkout-form card">
                <h3>Shipping Information</h3>

                <div class="form-group">
                  <label for="name">Name</label>
                  <input id="name" v-model="name" type="text" placeholder="Your full name" required />
                </div>

                <div class="form-group">
                  <label for="address">Address</label>
                  <input id="address" v-model="address" type="text" placeholder="Shipping address" required />
                </div>

                <div class="form-group">
                  <label for="phone">Phone Number</label>
                  <input id="phone" v-model="phone" type="text" placeholder="Contact number" required />
                </div>

                <button type="submit" class="btn primary full">Place Order</button>
              </form>
            </div>

            <div class="order-summary-container">
              <div class="order-summary card">
                <h3>Order Summary</h3>

                <div v-if="cartItems.length > 0" class="order-items">
                  <div v-for="item in cartItems" :key="item.id" class="order-item">
                    <div class="item-name">
                      <span>{{ item.product.naziv }}</span>
                      <span class="item-qty">x{{ item.quantity }}</span>
                    </div>
                    <div class="item-price">{{ formatPrice(item.product.cena * item.quantity) }}</div>
                  </div>

                  <div class="summary-divider"></div>

                  <div class="summary-row">
                    <span>Subtotal</span>
                    <span>{{ formatPrice(cartStore.cartTotal) }}</span>
                  </div>

                  <div class="summary-row">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>

                  <div class="summary-row total">
                    <span>Total</span>
                    <span>{{ formatPrice(cartStore.cartTotal) }}</span>
                  </div>
                </div>
                <p v-else>No items in cart</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useCartStore } from '@/stores/cartStore';
import { useNotification } from '@/utils/notifications';
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';

const router = useRouter();
const cartStore = useCartStore();
const { showNotification } = useNotification();
const name = ref("");
const address = ref("");
const phone = ref("");

// Koristi computed direktno umesto storeToRefs za reaktivno praćenje stavki korpe
const cartItems = computed(() =>
  cartStore.cartItems.filter(item => item && item.product)
);

// Obrađuje porudžbinu, čisti korpu i prikazuje obaveštenje o uspehu ili grešci
// Obrađuje slanje porudžbine, čisti korpu i prikazuje obaveštenje.
const submitOrder = () => {
  try {
    if (cartStore.isEmpty) {
      throw new Error("Cart is empty!");
    }

    // Ovde bi išla logika za slanje porudžbine na server
    console.log("Submitting order:", {
      name: name.value,
      address: address.value,
      phone: phone.value,
      items: cartItems.value,
      total: cartStore.cartTotal,
    });

    // Čisti korpu i prikazuje poruku o uspehu
    cartStore.clearCart();
    showNotification("Order placed successfully!", "success");

    // Preusmerava na početnu stranicu
    router.push('/');
  } catch (error) {
    console.error(error);
    showNotification(error instanceof Error ? error.message : 'An error occurred', "error");
  }
};

// Pomoćna funkcija za formatiranje cene (Napomena: Proveriti konzistentnost valute)
// Formatira cenu u string valute.
function formatPrice(price: number | string): string {
  if (price == null) return '$0.00';

  const num = typeof price === 'string' ? parseFloat(price) : price;
  return isNaN(num) ? '$0.00' : `$${num.toFixed(2)}`;
}
</script>

<style scoped>
@import "../assets/styles/shared.css";

/* Layout */
.checkout-page {
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
.checkout-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
}

/* Form styling */
.checkout-form {
  padding: 2rem;
}

.checkout-form h3 {
  font-size: 1.5rem;
  color: #2d3748;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #4a5568;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

/* Order summary */
.order-summary {
  position: sticky;
  top: 2rem;
  padding: 2rem;
}

.order-summary h3 {
  font-size: 1.5rem;
  color: #2d3748;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 1rem;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.75rem;
}

.item-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4a5568;
}

.item-qty {
  color: #6b7280;
  font-size: 0.9rem;
}

.item-price {
  font-weight: 600;
  color: #2d3748;
}

.summary-divider {
  height: 1px;
  background-color: #e2e8f0;
  margin: 1rem 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  color: #4a5568;
}

.summary-row.total {
  margin-top: 1rem;
  font-size: 1.2rem;
  font-weight: 700;
  color: #2d3748;
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

/* Empty checkout - updated to match Cart.vue styling */
.empty-checkout {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.empty-content {
  text-align: center;
  padding: 3rem;
  max-width: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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

/* Responsive */
@media (max-width: 1024px) {
  .checkout-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 2rem 0;
  }

  .container {
    padding: 0 1rem;
  }

  .checkout-form,
  .order-summary {
    padding: 1.5rem;
  }
}
</style>
