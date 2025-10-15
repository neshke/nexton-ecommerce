<template>
  <div class="user-orders">
    <h2 class="orders-title">Moje Porudžbine</h2>
    <div v-if="ordersStore.loading" class="loading-indicator">
      Učitavanje porudžbina...
    </div>
    <div v-else-if="ordersStore.orders.length === 0 && !ordersStore.error" class="no-orders">
      <div class="no-orders-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="m1 1 4 4 l4 13h11l4-8H6"></path>
        </svg>
      </div>
      <h3 class="no-orders-title">Još uvek nemate porudžbine</h3>
      <p class="no-orders-description">
        Kada izvršite svoju prvу porudžbinu, ovde ćete moći da pratite njen status i istoriju svih vaših kupovina.
      </p>
      <div class="no-orders-action">
        <router-link to="/products" class="shop-now-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9,22 9,12 15,12 15,22"></polyline>
          </svg>
          Počni kupovinu
        </router-link>
      </div>
    </div>
    <div v-else-if="ordersStore.orders.length > 0">
      <div v-for="order in ordersStore.orders" :key="order.id" class="order-card" @click="emitShowOrderDetails(order)">
        <div class="order-header">
          <h3>Porudžbina #{{ order.id }}</h3>
          <p>Datum: {{ formatDate(order.datum_porudzbine) }}</p>
        </div>
        <div class="order-body">
          <p>Status: <span :class="getStatusClass(order.status)">{{ order.status }}</span></p>
          <p>Ukupan iznos: {{ formatCurrency(order.ukupan_iznos) }}</p>
          <p v-if="order.ime_prezime">Primalac: {{ order.ime_prezime }}</p>
          <p v-if="order.adresa">Adresa dostave: {{ order.adresa }}</p>
          <p v-if="order.telefon">Kontakt telefon: {{ order.telefon }}</p>
        </div>
      </div>
    </div>
    <div v-if="ordersStore.error" class="error-message">
      Greška: {{ ordersStore.error }}
    </div>
  </div>
</template>

<script setup lang="ts">// Dodato lang="ts"
import { onMounted, defineEmits } from 'vue';
import { useOrdersStore } from '@/stores/ordersStore';
import type { Order } from '@/models'; // Importovan Order tip iz src/models/index.ts

const ordersStore = useOrdersStore();
const emit = defineEmits(['show-order-details']);

const emitShowOrderDetails = (order: Order) => {
  emit('show-order-details', order);
};

const formatDate = (dateString: string | undefined) => { // Dodata anotacija tipa
  if (!dateString) return '';
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }; // Dodata anotacija tipa
  return new Date(dateString).toLocaleDateString('sr-RS', options);
};

const formatCurrency = (value: number | string | undefined) => {
  if (value === undefined || value === null) return '';
  let numValue: number;
  if (typeof value === 'string') {
    numValue = parseFloat(value);
    if (isNaN(numValue)) return value;
  } else {
    numValue = value;
  }
  return numValue.toLocaleString('sr-RS', { style: 'currency', currency: 'EUR' });
};

const getStatusClass = (status: string | undefined) => { // Dodata anotacija tipa
  if (!status) return '';
  return 'status-' + status.toLowerCase().replace(/\s+/g, '-'); // npr. status-na-cekanju
};

onMounted(() => {
  ordersStore.fetchUserOrders();
});

</script>

<style scoped>
.user-orders {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.orders-title {
  color: #333;
  /* Tamnija boja teksta */
  font-size: 1.8em;
  /* Povećana veličina fonta */
  font-weight: 600;
  /* Malo deblji font */
  margin-bottom: 25px;
  /* Više prostora ispod naslova */
  padding-bottom: 10px;
  /* Dodatni prostor pre donje linije */
  border-bottom: 2px solid #6366f1;
  /* Suptilna donja linija u boji akcenta */
  text-align: left;
  /* Poravnanje teksta, može biti i center */
  display: inline-block;
  /* Da border-bottom bude samo ispod teksta */
}

.order-card {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 20px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  /* Add this line */
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 10px;
}

.order-header h3 {
  margin: 0;
  font-size: 1.2em;
  color: #333;
}

.order-header p {
  margin: 0;
  font-size: 0.9em;
  color: #666;
}

.order-body p {
  margin: 8px 0;
  /* Povećan razmak između paragrafa radi bolje čitljivosti */
  color: #555;
  font-size: 0.95em;
  /* Malo veći font za detalje */
}

.status-zavrsena {
  color: green;
  font-weight: bold;
}

.status-na-cekanju {
  /* Za "Na cekanju" */
  color: orange;
  font-weight: bold;
}

.status-otkazana {
  color: red;
  font-weight: bold;
}

.loading-indicator,
.error-message {
  text-align: center;
  padding: 20px;
  font-size: 1.1em;
  color: #777;
}

.no-orders {
  text-align: center;
  padding: 60px 20px;
  max-width: 500px;
  margin: 0 auto;
}

.no-orders-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
  color: #6366f1;
  opacity: 0.7;
}

.no-orders-title {
  font-size: 1.5em;
  font-weight: 600;
  color: #374151;
  margin: 0 0 16px 0;
}

.no-orders-description {
  font-size: 1em;
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 32px 0;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.no-orders-action {
  margin-top: 32px;
}

.shop-now-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.shop-now-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  background: linear-gradient(135deg, #5855eb 0%, #7c3aed 100%);
  color: white;
  text-decoration: none;
}

.shop-now-btn svg {
  flex-shrink: 0;
}

.error-message {
  color: red;
  font-weight: bold;
}
</style>
