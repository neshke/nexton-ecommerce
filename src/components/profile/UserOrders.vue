<template>
  <div class="user-orders">
    <h2 class="orders-title">Moje Porudžbine</h2>
    <div v-if="ordersStore.loading" class="loading-indicator">
      Učitavanje porudžbina...
    </div>
    <div v-else-if="ordersStore.orders.length === 0 && !ordersStore.error" class="no-orders">
      Nemate prethodnih porudžbina.
    </div>
    <div v-else-if="ordersStore.orders.length > 0">
      <div v-for="order in ordersStore.orders" :key="order.id" class="order-card">
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
          <!-- Ovde se mogu dodati detalji stavki porudžbine ako je potrebno -->
        </div>
      </div>
    </div>
    <div v-if="ordersStore.error" class="error-message">
      Greška: {{ ordersStore.error }}
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useOrdersStore } from '@/stores/ordersStore';

const ordersStore = useOrdersStore();

const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('sr-RS', options);
};

const formatCurrency = (value) => {
  if (typeof value !== 'number') {
    try {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return value;
      return numValue.toLocaleString('sr-RS', { style: 'currency', currency: 'EUR' });
    } catch (e) {
      return value;
    }
  }
  return value.toLocaleString('sr-RS', { style: 'currency', currency: 'EUR' });
};

const getStatusClass = (status) => {
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
.no-orders,
.error-message {
  text-align: center;
  padding: 20px;
  font-size: 1.1em;
  color: #777;
}

.error-message {
  color: red;
  font-weight: bold;
}
</style>
