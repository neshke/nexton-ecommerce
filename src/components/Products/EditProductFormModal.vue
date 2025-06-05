<template>
  <Teleport to="#modal-container" v-if="show">
    <div class="modal-overlay product-modal">
      <div class="modal-container">
        <div class="modal-header">
          <h2>Izmeni proizvod</h2>
          <button class="close-button" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label for="edit-name">Naziv proizvoda*</label>
              <input id="edit-name" v-model="editableProduct.naziv" type="text" required
                placeholder="Unesite naziv proizvoda" />
            </div>

            <div class="form-group">
              <label for="edit-description">Opis*</label>
              <textarea id="edit-description" v-model="editableProduct.opis" required
                placeholder="Unesite opis proizvoda"></textarea>
            </div>

            <div class="form-group">
              <label for="edit-price">Cena*</label>
              <input id="edit-price" v-model="editableProduct.cena" type="number" step="0.01" min="0" required
                placeholder="Unesite cenu" />
            </div>

            <div class="form-group">
              <label for="edit-category">Kategorija*</label>
              <select id="edit-category" v-model="editableProduct.kategorija_id" required>
                <option value="" disabled>Izaberite kategoriju</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.naziv }}
                </option>
              </select>
              <div v-if="categories.length === 0" class="form-error">
                Nema dostupnih kategorija. Prvo kreirajte kategorije.
              </div>
            </div>

            <div class="form-group">
              <label for="edit-stock">Količina na stanju*</label>
              <input id="edit-stock" v-model="editableProduct.kolicina_na_stanju" type="number" min="0" required
                placeholder="Unesite količinu" />
            </div>

            <div class="form-group">
              <label for="edit-image">Slika proizvoda</label>
              <div class="image-upload-container">
                <div v-if="editableProduct.slika_url" class="image-preview">
                  <img :src="getImagePreview(editableProduct.slika_url)" alt="Preview" />
                  <button type="button" @click="removeImage" class="remove-image">&times;</button>
                </div>
                <div v-if="!uploadInProgress && !editableProduct.slika_url" class="image-upload-controls">
                  <input id="edit-imageFile" ref="fileInput" type="file" accept="image/*"
                    @change="handleFileSelection" />
                  <div class="upload-button">
                    <span>Odaberite sliku</span>
                  </div>
                </div>
                <div v-if="uploadInProgress" class="upload-progress">
                  Otpremanje slike...
                </div>
                <div class="image-name-container" v-if="selectedFile && !editableProduct.slika_url">
                  <label for="edit-imageName">Naziv slike (opciono):</label>
                  <input id="edit-imageName" v-model="imageName" type="text" placeholder="Unesite naziv slike" />
                  <button type="button" @click="uploadImageHandler" class="upload-btn" :disabled="uploadInProgress">
                    Otpremi sliku
                  </button>
                </div>
              </div>
              <div v-if="imageError" class="form-error">
                {{ imageError }}
              </div>
              <div class="form-hint">
                Promenite ili dodajte novu sliku proizvoda. Podržani formati: JPG, PNG, GIF.
              </div>
            </div>

            <div class="form-group checkbox">
              <input id="edit-is_featured" v-model="editableProduct.istaknuto" type="checkbox" />
              <label for="edit-is_featured">Istaknuti proizvod</label>
            </div>

            <div class="form-group checkbox">
              <input id="edit-is_active" v-model="editableProduct.aktivan" type="checkbox" />
              <label for="edit-is_active">Aktivan (vidljiv kupcima)</label>
            </div>

            <div class="form-actions">
              <button type="button" class="cancel-btn" @click="closeModal">Otkaži</button>
              <button type="submit" class="submit-btn" :disabled="loading">
                {{ loading ? 'Čuvanje...' : 'Sačuvaj izmene' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts">
import { ref, watch, onMounted, defineComponent, type PropType } from 'vue';
import type { Product, Category } from '@/models/index';
import { useCategoryStore } from '@/stores/categoryStore';
import { useProductStore } from '@/stores/productStore';
import { useNotification } from '@/utils/notifications';

export default defineComponent({
  name: 'EditProductFormModal',
  props: {
    show: {
      type: Boolean,
      required: true
    },
    product: {
      type: Object as PropType<Product | null>,
      required: true
    }
  },

  emits: ['close', 'save'],

  setup(props, { emit }) {
    const loading = ref(false);
    const categoryStore = useCategoryStore();
    const productStore = useProductStore();
    const { showNotification } = useNotification();

    const categories = ref<Category[]>([]);
    const fileInput = ref<HTMLInputElement | null>(null);
    const selectedFile = ref<File | null>(null);
    const imageName = ref('');
    const uploadInProgress = ref(false);
    const imageError = ref('');

    const editableProduct = ref<Product>({
      id: 0, // Changed from undefined
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
      editableProduct.value = {
        id: 0, // Changed from undefined
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
      selectedFile.value = null;
      imageName.value = '';
      imageError.value = '';
      uploadInProgress.value = false;
      if (fileInput.value) {
        fileInput.value.value = '';
      }
    };

    watch(() => props.product, (newProduct) => {
      if (newProduct) {
        // Deep copy the product to avoid mutating the original object
        editableProduct.value = JSON.parse(JSON.stringify(newProduct));
        // Ensure numeric values are numbers
        editableProduct.value.cena = Number(newProduct.cena);
        editableProduct.value.kolicina_na_stanju = Number(newProduct.kolicina_na_stanju);
        editableProduct.value.kategorija_id = Number(newProduct.kategorija_id);
      } else {
        resetForm();
      }
    }, { immediate: true, deep: true });

    onMounted(async () => {
      await categoryStore.fetchCategories();
      categories.value = categoryStore.categories;
    });

    const handleFileSelection = (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (!input.files || input.files.length === 0) return;

      selectedFile.value = input.files[0];
      imageName.value = input.files[0].name.split('.')[0];
      imageError.value = '';
    };

    const uploadImageHandler = async () => {
      if (!selectedFile.value) {
        imageError.value = 'Niste odabrali sliku za otpremanje';
        return;
      }

      uploadInProgress.value = true;
      imageError.value = '';

      try {
        const imageUrl = await productStore.uploadImage(
          selectedFile.value,
          imageName.value
        );

        editableProduct.value.slika_url = imageUrl;
        selectedFile.value = null;
        imageName.value = '';
      } catch (error: any) {
        console.error('Error uploading image:', error);
        imageError.value = error.message || 'Greška prilikom otpremanja slike';
      } finally {
        uploadInProgress.value = false;
      }
    };

    const removeImage = () => {
      editableProduct.value.slika_url = '';
      selectedFile.value = null;
      imageName.value = '';
      imageError.value = '';
      if (fileInput.value) {
        fileInput.value.value = '';
      }
    };

    const closeModal = () => {
      emit('close');
    };

    const handleSubmit = async () => {
      if (!editableProduct.value.id) {
        showNotification('ID proizvoda nedostaje. Nije moguće ažurirati.', 'error');
        return;
      }
      loading.value = true;
      try {
        const productDataToUpdate: Product = {
          ...editableProduct.value,
          cena: Number(editableProduct.value.cena),
          kolicina_na_stanju: Number(editableProduct.value.kolicina_na_stanju),
          kategorija_id: Number(editableProduct.value.kategorija_id),
          istaknuto: Boolean(editableProduct.value.istaknuto),
          aktivan: Boolean(editableProduct.value.aktivan),
        };

        await productStore.updateProduct(productDataToUpdate);
        showNotification('Proizvod je uspešno ažuriran!', 'success');
        emit('save', productDataToUpdate);
        closeModal();
      } catch (error: any) {
        console.error('Error updating product:', error);
        showNotification(error.message || 'Greška prilikom ažuriranja proizvoda.', 'error');
      } finally {
        loading.value = false;
      }
    };

    const getImagePreview = (url: string | undefined) => {
      if (!url) return '';
      return productStore.formatImageUrl(url);
    };

    return {
      loading,
      editableProduct,
      fileInput,
      selectedFile,
      imageName,
      uploadInProgress,
      imageError,
      closeModal,
      handleSubmit,
      categories,
      handleFileSelection,
      uploadImageHandler,
      removeImage,
      getImagePreview
    };
  }
});
</script>

<style scoped>
/* Stilovi su sada identični kao u ProductFormModal.vue */
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
  /* z-index handled by global styling */
  padding: 1rem;
  /* Add padding for smaller screens */
}

.modal-container {
  background-color: white;
  width: 100%;
  /* Full width on small screens */
  max-width: 600px;
  height: 100%;
  /* Full height on small screens */
  max-height: 95vh;
  /* Max height with some margin */
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  /* Enable flex for header/body layout */
  flex-direction: column;
  /* Stack header and body vertically */
  overflow: hidden;
  /* Prevent content from overflowing container */
}

.modal-header {
  padding: 1rem;
  /* Adjust padding */
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  /* Prevent header from shrinking */
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  /* Adjust font size */
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
  padding: 1rem;
  /* Adjust padding */
  overflow-y: auto;
  /* Enable scrolling for modal body */
  flex-grow: 1;
  /* Allow body to take available space */
}

.form-group {
  margin-bottom: 1rem;
  /* Adjust margin */
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
  font-size: 0.9rem;
  /* Adjust font size for mobile */
  box-sizing: border-box;
  /* Ensure padding doesn't add to width */
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
  gap: 0.5rem;
  /* Adjust gap */
  margin-top: 1rem;
  /* Adjust margin */
  padding: 1rem;
  /* Add padding to form actions for separation */
  border-top: 1px solid #e2e8f0;
  /* Separator line */
  background-color: #f9fafb;
  /* Slight background for action area */
  flex-shrink: 0;
  /* Prevent actions from shrinking */
}

.cancel-btn,
.submit-btn {
  padding: 0.6rem 1.2rem;
  /* Adjust padding */
  font-size: 0.9rem;
  /* Adjust font size for mobile */
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background-color: #e2e8f0;
  color: #475569;
}

.submit-btn {
  background-color: #6366f1;
  color: white;
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

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.form-hint,
.form-error {
  margin-top: 0.25rem;
  font-size: 0.875rem;
}

.form-hint {
  color: #64748b;
}

.form-error {
  color: #ef4444;
}

.image-upload-container {
  margin-bottom: 1rem;
}

.image-preview {
  position: relative;
  max-width: 150px;
  /* Adjust preview size */
  margin-bottom: 10px;
}

.image-preview img {
  width: 100%;
  height: auto;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.remove-image {
  position: absolute;
  top: -8px;
  /* Adjust position */
  right: -8px;
  /* Adjust position */
  background: #ff4d4f;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  /* Adjust size */
  height: 20px;
  /* Adjust size */
  font-size: 12px;
  /* Adjust font size */
  line-height: 20px;
  /* Adjust line height */
  text-align: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}


.image-upload-controls {
  position: relative;
  width: 100%;
  height: 40px;
  margin-bottom: 10px;
}

.image-upload-controls input[type="file"] {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
}

.upload-button {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e2e8f0;
  border: 1px dashed #64748b;
  border-radius: 6px;
  z-index: 1;
  transition: all 0.2s;
}

.image-upload-controls:hover .upload-button {
  background-color: #cbd5e1;
}

.upload-button span {
  font-size: 0.875rem;
  color: #475569;
}

.image-name-container {
  margin-top: 1rem;
  padding: 10px;
  background-color: #f8fafc;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.image-name-container label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  color: #334155;
}

.image-name-container input[type="text"] {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  box-sizing: border-box;
}

.upload-btn {
  padding: 0.5rem 1rem;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 0.875rem;
  width: 100%;
  /* Make button full width */
}

.upload-btn:hover {
  background-color: #4338ca;
}

.upload-btn:disabled {
  background-color: #a5b4fc;
  cursor: not-allowed;
}

.upload-progress {
  text-align: center;
  padding: 1rem;
  font-style: italic;
  color: #64748b;
}

/* Responsive adjustments for smaller screens */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0 !important;
    align-items: stretch !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    /* z-index handled by global styling */
  }

  .modal-container {
    width: 100% !important;
    height: 100vh !important;
    max-width: none !important;
    max-height: none !important;
    border-radius: 0 !important;
    display: flex !important;
    flex-direction: column !important;
    /* Support for devices with notches/safe areas */
    padding-top: env(safe-area-inset-top) !important;
    padding-bottom: env(safe-area-inset-bottom) !important;
    margin: 0 !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    /* z-index handled by global styling */
  }

  .modal-header h2 {
    font-size: 1.1rem;
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
  }

  .form-group input[type="text"],
  .form-group input[type="number"],
  .form-group textarea,
  .form-group select {
    font-size: 0.85rem;
    padding: 0.6rem;
  }

  .form-actions {
    padding: 0.75rem;
    /* Adjust padding for smaller screens */
    gap: 0.5rem;
  }

  .cancel-btn,
  .submit-btn {
    padding: 0.6rem 1rem;
    /* Adjust button padding */
    font-size: 0.85rem;
    min-height: 44px;
  }

  .close-button {
    padding: 1rem;
    font-size: 1.75rem;
    min-width: 44px;
    min-height: 44px;
  }

  .image-preview {
    max-width: 120px;
  }
}
</style>
