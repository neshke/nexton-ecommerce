<template>
  <div class="admin-orders-page">
    <h1 class="page-title">Pregled Svih Porudžbina (Admin)</h1>

    <div v-if="ordersStore.loading" class="loading-indicator">
      Učitavanje porudžbina...
    </div>

    <div v-else-if="ordersStore.error" class="error-message">
      <p>Greška: {{ ordersStore.error }}</p>
      <button @click="retryFetch" class="btn btn-primary">Pokušaj ponovo</button>
    </div>

    <div v-else-if="!ordersStore.orders || ordersStore.orders.length === 0" class="no-orders">
      Nema pronađenih porudžbina.
    </div>

    <div v-else class="orders-list">
      <div v-for="order in ordersStore.orders" :key="order.id" class="order-card-admin">
        <div class="order-header">
          <h3>Porudžbina #{{ order.id }}</h3>
          <p>Datum: {{ formatDate(order.datum_porudzbine) }}</p>
        </div>
        <div class="order-body">
          <p>Status: <span :class="getStatusClass(order.status)">{{ order.status }}</span></p>
          <p>Ukupan iznos: {{ formatCurrency(order.ukupan_iznos) }}</p>
          <p v-if="order.korisnik_id">Korisnik ID: {{ order.korisnik_id }}</p>
          <p v-if="order.korisnicko_ime">Korisničko ime: {{ order.korisnicko_ime }}</p>
          <!-- Prikaz korisničkog imena -->
          <!-- Možete dodati dugme za prikaz detalja porudžbine -->
          <!-- <button @click="viewOrderDetails(order.id)" class="btn btn-secondary btn-sm">Detalji</button> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useOrdersStore } from '@/stores/ordersStore';
import { useAuthStore } from '@/stores/authStore';

const ordersStore = useOrdersStore();
const authStore = useAuthStore();

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('sr-RS', options);
};

const formatCurrency = (value?: number | string) => {
  if (value === undefined || value === null) return 'N/A';
  let numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return String(value); // Vrati originalnu vrednost ako nije validan broj
  return numValue.toLocaleString('sr-RS', { style: 'currency', currency: 'EUR' });
};

const getStatusClass = (status?: string) => {
  if (!status) return '';
  return 'status-' + status.toLowerCase().replace(/\s+/g, '-');
};

// const viewOrderDetails = (orderId: string | number) => {
//   // Implementirati logiku za prikaz detalja, npr. navigacija na drugu stranicu
//   // router.push({ name: 'AdminOrderDetail', params: { id: orderId } });
//   console.log('Prikaz detalja za porudžbinu:', orderId);
// };

const fetchOrders = () => {
  if (authStore.isAdmin) {
    ordersStore.fetchAllOrdersAdmin();
  } else {
    ordersStore.error = "Nemate administratorska prava za pristup ovoj stranici.";
  }
};

const retryFetch = () => {
  fetchOrders();
}

onMounted(() => {
  // Provera da li je korisnik admin pre dohvatanja podataka
  if (!authStore.isAdmin) {
    console.warn("Pokušaj pristupa admin stranici porudžbina od strane ne-administratora.");
    ordersStore.error = "Nemate administratorska prava za pristup ovoj stranici.";
    return; // Ne nastavljaj sa dohvatanjem ako nije admin
  }
  fetchOrders();
});

</script>

<style scoped>
.admin-orders-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

.page-title {
  color: #333;
  font-size: 2em;
  font-weight: bold;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #6366f1;
  /* Indigo boja kao akcenat */
  text-align: center;
}

.orders-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.order-card-admin {
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.order-card-admin:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 0.75rem;
  margin-bottom: 0.75rem;
}

.order-header h3 {
  margin: 0;
  font-size: 1.3em;
  color: #6366f1;
  /* Indigo boja */
}

.order-header p {
  margin: 0;
  font-size: 0.85em;
  color: #757575;
}

.order-body p {
  margin: 0.5rem 0;
  color: #424242;
  font-size: 0.95em;
}

.order-body p:last-child {
  margin-bottom: 0;
}

/* Stilovi za statuse kao u UserOrders.vue */
.status-zavrsena {
  color: #4caf50;
  /* Zelena */
  font-weight: bold;
}

.status-na-cekanju {
  color: #ff9800;
  /* Narandžasta */
  font-weight: bold;
}

.status-otkazana {
  color: #f44336;
  /* Crvena */
  font-weight: bold;
}

.loading-indicator,
.no-orders,
.error-message {
  text-align: center;
  padding: 2rem;
  font-size: 1.2em;
  color: #757575;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-top: 1rem;
}

.error-message {
  color: #d32f2f;
  /* Tamno crvena za greške */
  background-color: #ffebee;
  border: 1px solid #d32f2f;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
  border: none;
}

.btn-primary {
  background-color: #6366f1;
  color: white;
}

.btn-primary:hover {
  background-color: #4f52c4;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875em;
}
</style>
