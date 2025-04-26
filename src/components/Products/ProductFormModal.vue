<template>
  <Transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self.stop>
      <div class="modal-container">
        <div class="modal-header">
          <h2>Dodaj novi proizvod</h2>
          <button class="close-button" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label for="name">Naziv proizvoda*</label>
              <input id="name" v-model="productForm.naziv" type="text" required placeholder="Unesite naziv proizvoda" />
            </div>

            <div class="form-group">
              <label for="description">Opis*</label>
              <textarea id="description" v-model="productForm.opis" required
                placeholder="Unesite opis proizvoda"></textarea>
            </div>

            <div class="form-group">
              <label for="price">Cena*</label>
              <input id="price" v-model="productForm.cena" type="number" step="0.01" min="0" required
                placeholder="Unesite cenu" />
            </div>

            <div class="form-group">
              <label for="category">Kategorija*</label>
              <select id="category" v-model="productForm.kategorija_id" required>
                <option value="" disabled>Izaberite kategoriju</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.naziv }}
                </option>
              </select>
              <div v-if="categories.length === 0" class="form-error">
                Nema dostupnih kategorija. Prvo kreirajte kategorije.
              </div>
              <div class="form-hint">
                Obavezno izaberite važeću kategoriju sa liste.
              </div>
            </div>

            <div class="form-group">
              <label for="stock">Količina na stanju*</label>
              <input id="stock" v-model="productForm.kolicina_na_stanju" type="number" min="0" required
                placeholder="Unesite količinu" />
            </div>

            <div class="form-group">
              <label for="image">URL slike</label>
              <input id="image" v-model="productForm.slika_url" type="text" placeholder="Unesite URL slike" />
            </div>

            <div class="form-group checkbox">
              <input id="is_featured" v-model="productForm.istaknuto" type="checkbox" />
              <label for="is_featured">Istaknuti proizvod</label>
            </div>

            <div class="form-group checkbox">
              <input id="is_active" v-model="productForm.aktivan" type="checkbox" />
              <label for="is_active">Aktivan (vidljiv kupcima)</label>
            </div>

            <div class="form-actions">
              <button type="button" class="cancel-btn" @click="closeModal">Otkaži</button>
              <button type="submit" class="submit-btn" :disabled="loading">
                {{ loading ? 'Dodavanje...' : 'Dodaj proizvod' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script lang="ts">
import { ref, watch } from 'vue';
import type { Product, Category } from '@/models/index';

export default {
  props: {
    show: {
      type: Boolean,
      required: true
    },
    categories: {
      type: Array as () => Category[],
      required: true
    }
  },

  emits: ['close', 'save'],

  setup(props, { emit }) {
    const loading = ref(false);

    const productForm = ref<Partial<Product>>({
      id: undefined,
      naziv: '',
      opis: '',
      slug: '',
      cena: 0,
      kategorija_id: 0,
      kolicina_na_stanju: 1,
      slika_url: '',
      istaknuto: false,
      aktivan: true
    });

    const resetForm = () => {
      productForm.value = {
        id: undefined,
        naziv: '',
        opis: '',
        slug: '',
        cena: 0,
        kategorija_id: 0,
        kolicina_na_stanju: 1,
        slika_url: '',
        istaknuto: false,
        aktivan: true
      };
    };


    // Reset form when modal is closed/opened
    watch(() => props.show, (isShown) => {
      if (isShown) {
        resetForm();
      }
    });

    const closeModal = () => {
      emit('close');
    };

    const handleSubmit = async () => {
      loading.value = true;

      try {
        // Create a proper Product object (without id for new products)
        const productData: Partial<Product> = {
          ...productForm.value,
          // Ensure fields are the correct types
          cena: Number(productForm.value.cena),
          kolicina_na_stanju: Number(productForm.value.kolicina_na_stanju),
          kategorija_id: Number(productForm.value.kategorija_id),
          istaknuto: Boolean(productForm.value.istaknuto),
          aktivan: Boolean(productForm.value.aktivan)
        };

        // Emit the save event with the product data
        emit('save', productData);

        // Close the modal after submitting
        closeModal();

        // Reset the form
        resetForm();
      } catch (error) {
        console.error('Error submitting form:', error);
      } finally {
        loading.value = false;
      }
    };

    return {
      loading,
      productForm,
      resetForm,
      closeModal,
      handleSubmit
    };
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background-color: white;
  width: 90%;
  max-width: 600px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #1e293b;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #334155;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 1rem;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.checkbox {
  display: flex;
  align-items: center;
}

.checkbox input {
  margin-right: 0.5rem;
  width: auto;
}

.checkbox label {
  margin-bottom: 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  background-color: #e2e8f0;
  color: #475569;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn {
  padding: 0.75rem 1.5rem;
  background-color: #6366f1;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover {
  background-color: #4f46e5;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.cancel-btn:hover {
  background-color: #cbd5e1;
}

/* Modal transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.form-hint {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #64748b;
}

.form-error {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #ef4444;
}
</style>
