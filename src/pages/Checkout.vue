<template>
  <div class="checkout-page">
    <Header title="Završi" highlighted="Porudžbinu" subtitle="Kompletirajte vašu narudžbinu" />

    <main class="main-content">
      <div class="container">
        <div v-if="cartStore.isEmpty" class="empty-checkout animate-fade-in">
          <div class="empty-content card">
            <i class="fas fa-shopping-bag empty-icon"></i>
            <h2>Vaša korpa je prazna</h2>
            <p>Dodajte proizvode u korpu pre nego što završite porudžbinu.</p>
            <router-link to="/products" class="btn primary">Kupujte sada</router-link>
          </div>
        </div>
        <div v-else class="checkout-container animate-fade-in">
          <h2 class="title">Plaćanje</h2>

          <div class="checkout-grid">
            <div class="checkout-form-container">
              <form @submit.prevent="submitOrder" class="checkout-form card" novalidate>
                <h3>Informacije o isporuci</h3>

                <div class="form-group">
                  <label for="name">Ime i prezime</label>
                  <input id="name" v-model="name" type="text" placeholder="Vaše puno ime i prezime" required />
                  <p v-if="nameError" class="error-text">{{ nameError }}</p>
                </div>

                <div class="form-group">
                  <label for="address">Adresa</label>
                  <input id="address" v-model="address" type="text" placeholder="Ulica i broj, mesto" required />
                  <p v-if="addressError" class="error-text">{{ addressError }}</p>
                </div>

                <div class="form-group">
                  <label for="phone">Broj telefona</label>
                  <input id="phone" v-model="phone" type="text" placeholder="Npr. 06xxxxxxxx ili +3816xxxxxxxx"
                    required />
                  <p v-if="phoneError" class="error-text">{{ phoneError }}</p>
                </div>

                <!-- Polje za email gosta, opciono, ako korisnik nije ulogovan -->
                <div class="form-group" v-if="!authStore.user">
                  <label for="email">Email za potvrdu</label>
                  <input id="email" v-model="guestEmail" type="email" placeholder="Vaša email adresa" />
                  <p v-if="guestEmailError" class="error-text">{{ guestEmailError }}</p>
                </div>

                <button type="submit" class="btn primary full" :disabled="isSubmitting || !isFormValid">
                  <span v-if="isSubmitting" class="spinner-border" role="status" aria-hidden="true"></span>
                  <span v-else>Naručite</span>
                </button>
              </form>
            </div>

            <div class="order-summary-container">
              <div class="order-summary card">
                <h3>Pregled porudžbine</h3>

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
                    <span>Ukupno</span>
                    <span>{{ formatPrice(cartStore.cartTotal) }}</span>
                  </div>

                  <div class="summary-row">
                    <span>Isporuka</span>
                    <span>Besplatna</span>
                  </div>

                  <div class="summary-row total">
                    <span>Ukupno za plaćanje</span>
                    <span>{{ formatPrice(cartStore.cartTotal) }}</span>
                  </div>
                </div>
                <p v-else>Nema proizvoda u korpi</p>
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
import { useOrdersStore } from '@/stores/ordersStore';
import { useAuthStore } from '@/stores/authStore';
import { useNotification } from '@/utils/notifications';
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import type { CreateOrderPayload, CreateOrderItemPayload } from '@/models/order';

const router = useRouter();
const cartStore = useCartStore();
const ordersStore = useOrdersStore();
const authStore = useAuthStore();
const { showNotification } = useNotification();

const name = ref("");
const address = ref("");
const phone = ref("");
const guestEmail = ref("");
const isSubmitting = ref(false);

// Computed svojstva za validaciju i greške
const nameError = computed(() => {
  if (!name.value.trim()) return 'Ime i prezime je obavezno.';
  if (name.value.trim().length < 3) return 'Ime i prezime mora imati bar 3 karaktera.';
  return '';
});

const addressError = computed(() => {
  if (!address.value.trim()) return 'Adresa je obavezna.';
  if (address.value.trim().length < 5) return 'Adresa mora imati bar 5 karaktera.';
  return '';
});

const phoneError = computed(() => {
  if (!phone.value.trim()) return 'Broj telefona je obavezan.';
  const cleanedPhone = phone.value.trim().replace(/[^0-9]/g, ''); // Uklanja sve osim brojeva za proveru dužine
  if (cleanedPhone.length < 6) return 'Unesite validan broj telefona (minimum 6 cifara).';
  return '';
});

const guestEmailError = computed(() => {
  if (!authStore.user && !guestEmail.value.trim()) {
    return 'Email je obavezan za potvrdu ako niste ulogovani.';
  }
  if (guestEmail.value.trim() && !/^\S+@\S+\.\S+$/.test(guestEmail.value.trim())) {
    return 'Unesite validnu email adresu.';
  }
  return '';
});

const isFormValid = computed(() => {
  return !nameError.value &&
    !addressError.value &&
    !phoneError.value &&
    (authStore.user || !guestEmailError.value);
});

const cartItems = computed(() =>
  cartStore.cartItems.filter(item => item && item.product)
);

const submitOrder = async () => {
  if (!isFormValid.value) {
    // Opciono: Pokaži notifikaciju za prvu grešku koja se nađe, ili opštu poruku
    // Možemo naći prvu grešku i fokusirati to polje ako želimo
    let firstErrorMessage = nameError.value || addressError.value || phoneError.value || (!authStore.user ? guestEmailError.value : '');
    showNotification(firstErrorMessage || "Molimo ispravite greške u formi.", "error");
    return;
  }
  if (cartStore.isEmpty) {
    showNotification("Korpa je prazna!", "error");
    return;
  }

  isSubmitting.value = true;

  const orderItemsPayload: CreateOrderItemPayload[] = cartItems.value.map(item => ({
    product_id: item.product.id,
    kolicina: item.quantity,
    cena_po_komadu: typeof item.product.cena === 'string' ? parseFloat(item.product.cena) : item.product.cena,
  }));

  const orderDetails: CreateOrderPayload = {
    user_id: authStore.user ? authStore.user.id : null,
    ime_prezime: name.value.trim(),
    adresa: address.value.trim(),
    telefon: phone.value.trim(),
    ukupan_iznos: cartStore.cartTotal,
    stavke: orderItemsPayload,
    email_za_potvrdu: authStore.user ? authStore.user.email : (guestEmail.value.trim() || undefined),
  };

  try {
    const orderResponse = await ordersStore.createOrder(orderDetails); // promenjeno ime promenljive da se ne sukobljava
    if (orderResponse.success) { // koristi se orderResponse
      cartStore.clearCart();
      showNotification(orderResponse.message || "Porudžbina je uspešno poslata!", "success");
      router.push('/');
    } else {
      showNotification(orderResponse.message || 'Došlo je do greške prilikom slanja porudžbine.', "error");
    }
  } catch (error: any) {
    console.error("Greška prilikom slanja porudžbine:", error);
    showNotification(error.message || 'Došlo je do neočekivane greške.', "error");
  } finally {
    isSubmitting.value = false;
  }
};

function formatPrice(price: number | string): string {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numericPrice)) {
    return 'N/A';
  }
  return numericPrice.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

</script>

<style scoped>
.checkout-page {
  display: flex;
  flex-direction: column;
  background-color: #f9f9f9;
}

.main-content {
  flex: 1;
  padding-top: 1rem;
  /* Dodat osnovni padding */
  padding-bottom: 2rem;
  /* Dodat osnovni padding */
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.empty-checkout {
  text-align: center;
  padding: 3rem 0;
}

.empty-content {
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: inline-block;
}

.empty-icon {
  font-size: 4rem;
  color: #6366f1;
  /* Ljubičasta boja */
  margin-bottom: 1rem;
}

.empty-content h2 {
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.empty-content p {
  margin-bottom: 1.5rem;
  color: #666;
}

.checkout-container .title {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #333;
  font-weight: 600;
}

.checkout-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 992px) {
  .checkout-grid {
    grid-template-columns: 2fr 1fr;
    /* Formular širi, pregled uži */
  }
}

.checkout-form-container {
  display: block;
}

.order-summary-container {
  display: block;
}

.card {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.checkout-form h3,
.order-summary h3 {
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.75rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

.form-group input[type="text"],
.form-group input[type="email"] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  transition: border-color 0.2s ease-in-out;
}

.form-group input[type="text"]:focus,
.form-group input[type="email"]:focus {
  border-color: #6366f1;
  /* Ljubičasta boja */
  outline: none;
}

.error-text {
  color: #e53e3e;
  /* Tailwind red-600 */
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-group input.invalid {
  border-color: #e53e3e !important;
  /* Osigurava da se primeni preko focus stila */
}

.btn.primary.full {
  width: 100%;
  padding: 0.85rem 1rem;
  font-size: 1rem;
  background-color: #6366f1;
  /* Osnovna ljubičasta boja */
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, opacity 0.2s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1.5;
}

.btn.primary.full:hover:not(:disabled) {
  background-color: #4f46e5;
  /* Tamnija ljubičasta na hover */
}

.btn.primary.full:disabled {
  background-color: #a5b4fc;
  /* Svetlija ljubičasta kada je onemogućeno */
  color: #e0e0e0;
  cursor: not-allowed;
  opacity: 0.7;
}

.btn.primary.full .spinner-border {
  width: 1em;
  /* Veličina spinnera relativna u odnosu na font dugmeta */
  height: 1em;
  margin-right: 0.5rem;
  /* Razmak između spinnera i teksta */
  /* Boja spinnera će biti currentColor (boja teksta dugmeta) */
}

.spinner-border {
  display: inline-block;
  /* width: 1rem; // Veličina se sada definiše unutar .btn.primary.full .spinner-border */
  /* height: 1rem; */
  vertical-align: -0.125em;
  /* Bolje vertikalno poravnanje sa tekstom */
  border: .2em solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  -webkit-animation: spinner-border .75s linear infinite;
  animation: spinner-border .75s linear infinite;
}

.order-summary .order-items {
  margin-bottom: 1rem;
}

.order-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.order-item:last-child {
  border-bottom: none;
}

.item-name {
  color: #555;
}

.item-qty {
  font-size: 0.9em;
  color: #777;
  margin-left: 0.5rem;
}

.item-price {
  font-weight: 500;
  color: #333;
}

.summary-divider {
  height: 1px;
  background-color: #eee;
  margin: 1rem 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  color: #555;
}

.summary-row span:last-child {
  font-weight: 500;
  color: #333;
}

.summary-row.total span {
  font-size: 1.1rem;
  font-weight: 600;
  color: #6366f1;
  /* Ljubičasta boja */
}
</style>
