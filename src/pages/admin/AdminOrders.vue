<template>
  <div class="admin-orders-page">
    <h1 class="page-title">Pregled Svih Porudžbina (Admin)</h1>
    <div class="filter-controls">
      <div class="search-control">
        <label for="searchInput">Pretraži po ID:</label>
        <div class="search-input-group">
          <input id="searchInput" v-model="searchInput" type="number" placeholder="Unesite ID porudžbine..."
            class="search-input" @keyup.enter="performSearch" min="1"> <button @click="performSearch" class="search-btn"
            :disabled="!searchInput">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path
                d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
            </svg>
          </button>
          <button v-if="searchQuery" @click="clearSearch" class="clear-btn" title="Obriši pretragu">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
              <path
                d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
            </svg>
          </button>
        </div>
      </div>
      <div class="status-filter-control">
        <label for="statusFilter">Filtriraj po statusu:</label>
        <select id="statusFilter" v-model="selectedStatusFilter" class="status-filter-select">
          <option value="Svi statusi">Svi statusi</option>
          <option value="Na cekanju">Na čekanju</option>
          <option value="Zavrsena">Završena</option>
          <option value="Otkazana">Otkazana</option>
        </select>
      </div>
    </div>

    <div v-if="ordersStore.loading && !selectedOrderForStatusUpdate" class="loading-indicator">
      Učitavanje porudžbina...
    </div>

    <div v-else-if="ordersStore.error" class="error-message">
      <p>Greška: {{ ordersStore.error }}</p>
      <button @click="retryFetch" class="btn btn-primary">Pokušaj ponovo</button>
    </div>

    <div v-else-if="!filteredOrders || filteredOrders.length === 0" class="no-orders">
      Nema pronađenih porudžbina za izabrani filter.
    </div>

    <div v-else class="orders-list">
      <div v-for="order in filteredOrders" :key="order.id" class="order-card-admin">
        <div class="order-card-clickable-area" @click="handleShowOrderDetails(order)">
          <div class="order-header">
            <h3>Porudžbina #{{ order.id }}</h3>
            <p>Datum: {{ formatDate(order.datum_porudzbine) }}</p>
          </div>
          <div class="order-body">
            <p>Ukupan iznos: {{ formatCurrency(order.ukupan_iznos) }}</p>
            <p v-if="order.korisnik_id">Korisnik ID: {{ order.korisnik_id }}</p>
            <p v-if="order.korisnicko_ime">Korisničko ime: {{ order.korisnicko_ime }}</p>
            <p v-if="order.ime_prezime">Primalac: {{ order.ime_prezime }}</p>
            <p v-if="order.adresa">Adresa: {{ order.adresa }}</p>
            <p v-if="order.telefon">Telefon: {{ order.telefon }}</p>
          </div>
        </div>
        <div class="order-status-management" v-if="order.id !== undefined">
          <p class="status-display" :class="getStatusClass(order.status)">Status: {{ order.status }}</p>
          <div class="status-update-form">
            <select v-model="orderStatusMap[String(order.id)]" :disabled="loadingStatusUpdate[String(order.id)]"
              class="status-select">
              <option value="Na cekanju">Na čekanju</option>
              <option value="Zavrsena">Završena</option>
              <option value="Otkazana">Otkazana</option>
            </select>
            <button @click="handleUpdateStatus(Number(order.id))"
              :disabled="loadingStatusUpdate[String(order.id)] || !orderStatusMap[String(order.id)] || orderStatusMap[String(order.id)] === order.status"
              class="btn btn-primary btn-sm">
              <span v-if="loadingStatusUpdate[String(order.id)]">Čuvanje...</span>
              <span v-else>Sačuvaj status</span>
            </button>
          </div>
          <p v-if="statusUpdateError[String(order.id)]" class="error-message status-error">{{
            statusUpdateError[String(order.id)] }}</p>
        </div>
      </div>
    </div>

    <!-- Order Details Modal -->
    <OrderDetailsModal :order="selectedOrder" :visible="isOrderDetailsModalVisible"
      @close="isOrderDetailsModalVisible = false" />

  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'; // Added computed
import { useOrdersStore } from '@/stores/ordersStore';
import { useAuthStore } from '@/stores/authStore';
import OrderDetailsModal from '@/components/orders/OrderDetailsModal.vue';
import type { Order } from '@/models';
import { useNotification } from '@/utils/notifications';

const ordersStore = useOrdersStore();
const authStore = useAuthStore();
const { showNotification } = useNotification();

const isOrderDetailsModalVisible = ref(false);
const selectedOrder = ref<Order | null>(null);
const orderStatusMap = ref<Record<string, string>>({}); // Changed number to string for index type
const loadingStatusUpdate = ref<Record<string, boolean>>({}); // Changed number to string
const statusUpdateError = ref<Record<string, string | null>>({}); // Changed number to string
const selectedOrderForStatusUpdate = ref<string | null>(null); // Changed number to string
const selectedStatusFilter = ref<string>('Svi statusi'); // Added for filtering
const searchQuery = ref<string>(''); // Added search query
const searchInput = ref<string>(''); // Added search input for button-based search

// Inicijalizacija orderStatusMap kada se porudžbine učitaju ili promene
watch(() => ordersStore.orders, (newOrders: any) => {
  if (newOrders) {
    newOrders.forEach((order: any) => {
      if (order.id !== undefined && order.status) {
        const orderIdStr = String(order.id); // Convert id to string for indexing
        if (!orderStatusMap.value[orderIdStr] || orderStatusMap.value[orderIdStr] !== order.status) {
          orderStatusMap.value[orderIdStr] = order.status;
        }
      }
    });
  }
}, { immediate: true, deep: true });

const filteredOrders = computed(() => {
  if (!ordersStore.orders) {
    return [];
  }
  const filterStatus = selectedStatusFilter.value;
  const query = searchQuery.value.trim().toLowerCase(); // Normalize search query

  return ordersStore.orders.filter(order => {
    // Check if order ID matches search query (if search query is provided)
    const matchesSearch = !query || String(order.id).toLowerCase().includes(query);

    // Check if order status matches filter (if specific status is selected)
    let matchesStatus = true;
    if (filterStatus !== 'Svi statusi' && order.status) {
      const orderStatusLower = order.status.toLowerCase();

      if (filterStatus === "Na cekanju") {
        matchesStatus = orderStatusLower === "na cekanju";
      } else if (filterStatus === "Zavrsena") {
        matchesStatus = orderStatusLower === "zavrsena";
      } else if (filterStatus === "Otkazana") {
        matchesStatus = orderStatusLower === "otkazana";
      } else {
        matchesStatus = false;
      }
    }

    return matchesSearch && matchesStatus;
  });
});

const handleShowOrderDetails = (order: Order) => {
  selectedOrder.value = order;
  isOrderDetailsModalVisible.value = true;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('sr-RS', options);
};

const formatCurrency = (value?: number | string) => {
  if (value === undefined || value === null) return 'N/A';
  let numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return String(value);
  return numValue.toLocaleString('sr-RS', { style: 'currency', currency: 'EUR' }); // Promenjeno u EUR
};

const getStatusClass = (status?: string) => {
  if (!status) return '';
  return 'status-' + status.toLowerCase().replace(/\s+/g, '-');
};

const fetchOrders = () => {
  if (authStore.isAdmin) {
    ordersStore.fetchAllOrdersAdmin();
  } else {
    ordersStore.error = "Nemate administratorska prava za pristup ovoj stranici.";
  }
};

const retryFetch = () => {
  fetchOrders();
};

const performSearch = () => {
  searchQuery.value = searchInput.value ? String(searchInput.value).trim() : '';
};

const clearSearch = () => {
  searchInput.value = '';
  searchQuery.value = '';
};

const handleUpdateStatus = async (orderIdInput: number | undefined) => {
  if (orderIdInput === undefined) {
    showNotification("ID porudžbine nije dostupan.", "error");
    return;
  }
  const orderIdStr = String(orderIdInput); // Convert id to string for indexing

  const newStatus = orderStatusMap.value[orderIdStr];
  if (!newStatus) {
    statusUpdateError.value[orderIdStr] = "Novi status nije izabran.";
    showNotification("Novi status nije izabran.", "error");
    return;
  }

  loadingStatusUpdate.value[orderIdStr] = true;
  statusUpdateError.value[orderIdStr] = null;
  selectedOrderForStatusUpdate.value = orderIdStr;

  const success = await ordersStore.updateOrderStatusAdmin(orderIdInput, newStatus);

  if (success) {
    showNotification(`Status porudžbine #${orderIdStr} je uspešno ažuriran na "${newStatus}".`, 'success');
  } else {
    statusUpdateError.value[orderIdStr] = ordersStore.error || 'Greška pri ažuriranju statusa.';
    showNotification(statusUpdateError.value[orderIdStr] || `Greška pri ažuriranju statusa za porudžbinu #${orderIdStr}.`, 'error');
  }
  loadingStatusUpdate.value[orderIdStr] = false;
  selectedOrderForStatusUpdate.value = null;
};

onMounted(() => {
  if (!authStore.isAdmin) {
    console.warn("Pokušaj pristupa admin stranici porudžbina od strane ne-administratora.");
    ordersStore.error = "Nemate administratorska prava za pristup ovoj stranici.";
    return;
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
  text-align: center;
}

.filter-controls {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.search-control {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.search-input-group {
  display: flex;
  align-items: stretch;
  gap: 0;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-input {
  padding: 0.75rem 1rem;
  border: 1px solid #ccc;
  border-right: none;
  font-size: 0.9em;
  width: 250px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  border-radius: 4px 0 0 4px;
}

.search-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
}

.search-btn {
  padding: 0.75rem 1rem;
  background-color: #6366f1;
  color: white;
  border: 1px solid #6366f1;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0;
}

.search-btn:hover:not(:disabled) {
  background-color: #4f46e5;
  transform: translateY(-1px);
}

.search-btn:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

.clear-btn {
  padding: 0.75rem;
  background-color: #ef4444;
  color: white;
  border: 1px solid #ef4444;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0 4px 4px 0;
  border-left: none;
}

.clear-btn:hover {
  background-color: #dc2626;
  transform: translateY(-1px);
}

.status-filter-control {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.status-filter-select {
  padding: 0.75rem 1rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 0.9em;
  min-width: 200px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  background-color: #fff;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.75rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

.status-filter-select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
}

.status-filter-select:hover {
  border-color: #9ca3af;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.orders-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  /* Povećana minimalna širina */
  gap: 1.5rem;
}

.order-card-admin {
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 0;
  /* Uklonjen padding da bi se clickable area proširila */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  display: flex;
  /* Omogućava razdvajanje na dva dela */
  flex-direction: column;
  /* Stack clickable area and status management */
}

.order-card-clickable-area {
  padding: 1.5rem;
  /* Vraćen padding ovde */
  cursor: pointer;
  flex-grow: 1;
  /* Omogućava da ovaj deo zauzme dostupan prostor */
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

.order-status-management {
  padding: 1rem 1.5rem 1.5rem;
  border-top: 1px solid #f0f0f0;
  background-color: #f9f9f9;
  border-radius: 0 0 8px 8px;
}

.status-display {
  margin-bottom: 0.75rem;
  font-weight: 500;
}

.status-update-form {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-select {
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  flex-grow: 1;
  font-size: 0.9em;
  background-color: #fff;
  /* Explicit white background */
  transition: background-color 0.2s ease, border-color 0.2s ease;
  /* Smooth transition */
}

.status-select:hover:not(:disabled) {
  background-color: #f0f0f0;
  /* Lighter grey on hover */
  border-color: #aaa;
  /* Darker border on hover */
}

.status-select:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.9em;
}

.status-error {
  font-size: 0.85em;
  margin-top: 0.5rem;
  color: #d32f2f;
  /* Ensure error color is applied */
}

/* Stilovi za statuse */
.status-zavrsena {
  color: #4caf50;
  /* Green */
  font-weight: bold;
}

.status-na-cekanju,
.status-na-čekanju {
  /* Added .status-na-čekanju for consistency if needed */
  color: orange;
  /* Orange, same as UserOrders.vue */
  font-weight: bold;
}

.status-otkazana {
  color: #f44336;
  /* Red */
  font-weight: bold;
}

/* Removed .status-u-obradi and .status-poslato as they are no longer used */

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
  background-color: #ffebee;
  border: 1px solid #d32f2f;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease, opacity 0.2s ease;
  border: none;
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #6366f1;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #4f52c4;
}
</style>
