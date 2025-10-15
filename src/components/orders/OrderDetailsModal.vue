<template>  <Teleport to="#modal-container" v-if="props.visible">
    <div class="modal order-details-modal" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3 v-if="props.order">Detalji Porudžbine #{{ props.order.id }}</h3>
          <h3 v-else>Detalji Porudžbine</h3>
          <button class="close-btn" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>        <div v-if="props.order" class="modal-body">
          <p><strong>Datum porudžbine:</strong> {{ formatDate(props.order.datum_porudzbine) }}</p>
          <p><strong>Status:</strong> <span :class="`status-${props.order.status?.toLowerCase()}`">{{ props.order.status }}</span>
          </p>
          <p><strong>Ukupan iznos:</strong> {{ formatCurrency(props.order.ukupan_iznos) }}</p>
          <p><strong>Ime i prezime:</strong> {{ props.order.ime_prezime }}</p>
          <p><strong>Adresa:</strong> {{ props.order.adresa }}</p>
          <p><strong>Telefon:</strong> {{ props.order.telefon }}</p>

          <h4>Stavke porudžbine:</h4>
          <ul v-if="props.order.stavke && props.order.stavke.length > 0" class="order-items-list">
            <li v-for="item in props.order.stavke" :key="item.stavka_id" class="order-item">
              <p><strong>Proizvod:</strong> {{ item.naziv_proizvoda }}</p>
              <p><strong>Količina:</strong> {{ item.kolicina }}</p>
              <p><strong>Cena po komadu:</strong> {{ formatCurrency(item.cena_po_komadu) }}</p>
              <p><strong>Ukupno za stavku:</strong> {{ formatCurrency(item.kolicina * item.cena_po_komadu) }}</p>
            </li>
          </ul>
          <p v-else>Nema stavki za ovu porudžbinu.</p>
        </div>
        <div v-else>
          <p>Nema podataka o porudžbini.</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import type { Order } from '@/models/order';
import { defineEmits, defineProps } from 'vue';

interface Props {
  order: Order | null;
  visible: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['close']);

const closeModal = () => {
  emit('close');
};

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A';
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('sr-RS', options);
};

const formatCurrency = (amount: number | string | undefined) => {
  if (amount === undefined || amount === null) return 'N/A';
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return numAmount.toLocaleString('sr-RS', { style: 'currency', currency: 'EUR' });
};
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  z-index: 1050;
  /* Ensure it's above other content */
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 700px;
  /* Adjusted for potentially more content */
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  animation: modalEnter 0.3s ease-out;
  /* Added animation */
}

/* Animation for modal entrance */
@keyframes modalEnter {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  /* Ensure consistent padding */
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 12px 12px 0 0;
}

.modal-header h3 {
  margin: 0;
  color: #2d3748;
  /* Matched from EditProfileModal */
  font-size: 1.25rem;
  /* Matched from EditProfileModal */
  font-weight: 600;
  /* Matched from EditProfileModal */
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  /* Matched from LogoutConfirmModal */
  cursor: pointer;
  color: #6b7280;
  /* Matched from EditProfileModal */
  transition: all 0.2s;
  padding: 0.5rem;
  /* Matched from LogoutConfirmModal */
  border-radius: 6px;
  /* Matched from LogoutConfirmModal */
  display: flex;
  align-items: center;
  justify-content: center;
  /* position: relative; */
  /* Removed as it might not be needed here */
  /* z-index: 2010; */
  /* Removed as it might not be needed here */
}

.close-btn:hover {
  color: #1f2937;
  /* Matched from EditProfileModal */
  background: #e5e7eb;
  /* Matched from EditProfileModal */
}

.modal-body {
  padding: 2rem;
  /* Added more padding to the body */
  flex-grow: 1;
}

.order-details p {
  margin: 8px 0;
  color: #555;
  line-height: 1.6;
}

.order-details strong {
  color: #333;
}

.order-items-list {
  list-style: none;
  padding: 0;
  margin-top: 15px;
}

.order-item {
  background-color: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 5px;
  padding: 15px;
  margin-bottom: 10px;
}

.order-item p {
  margin: 5px 0;
}

.status-na-cekanju {
  /* Za status 'na cekanju' */
  color: #ffa500;
  /* Orange */
  font-weight: bold;
}

.status-zavrsena {
  color: #4CAF50;
  /* Green */
  font-weight: bold;
}

.status-otkazana {
  color: #f44336;
  /* Red */
  font-weight: bold;
}

.modal-footer {
  padding: 1.5rem 2rem;
  /* Added padding to footer */
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  background-color: #f8f9fa;
  /* Optional: footer background */
  border-radius: 0 0 12px 12px;
}

/* Responsive adjustments if necessary */
@media (max-width: 768px) {
  .modal-content {
    max-width: 95%;
    margin: 1rem;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1.5rem;
    /* Adjusted padding for medium screens */
  }

  .modal-header h3 {
    font-size: 1.1rem;
  }
}

@media (max-width: 640px) {
  .modal {
    padding: 0;
    align-items: stretch;
  }

  .modal-content {
    width: 100%;
    height: 100vh;
    max-width: none;
    max-height: none;
    border-radius: 0;
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
    /* Adjusted padding for small screens */
  }
}
</style>
