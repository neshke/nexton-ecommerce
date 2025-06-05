<template>
  <Teleport to="#modal-container" v-if="show">
    <div class="modal-overlay product-modal">
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
              <label for="image">Slika proizvoda</label>
              <div class="image-upload-container">
                <div v-if="productForm.slika_url" class="image-preview">
                  <img :src="getImagePreview(productForm.slika_url)" alt="Preview" />
                  <button type="button" @click="removeImage" class="remove-image">&times;</button>
                </div>
                <div v-if="!uploadInProgress && !productForm.slika_url" class="image-upload-controls">
                  <input id="imageFile" ref="fileInput" type="file" accept="image/*" @change="handleFileSelection" />
                  <div class="upload-button">
                    <span>Odaberite sliku</span>
                  </div>
                </div>
                <div v-if="uploadInProgress" class="upload-progress">
                  Otpremanje slike...
                </div>
                <div class="image-name-container" v-if="selectedFile && !productForm.slika_url">
                  <label for="imageName">Naziv slike (opciono):</label>
                  <input id="imageName" v-model="imageName" type="text" placeholder="Unesite naziv slike" />
                  <button type="button" @click="uploadImage" class="upload-btn" :disabled="uploadInProgress">
                    Otpremi sliku
                  </button>
                </div>
              </div>
              <div v-if="imageError" class="form-error">
                {{ imageError }}
              </div>
              <div class="form-hint">
                Dodajte sliku proizvoda. Podržani formati: JPG, PNG, GIF.
              </div>
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
  </Teleport>
</template>

<script lang="ts">
import { ref, onBeforeMount } from 'vue';
import type { Product } from '@/models/index';
import { useCategoryStore } from '@/stores/categoryStore';
import { useProductStore } from '@/stores/productStore';

export default {
  props: {
    show: {
      type: Boolean,
      required: true
    }
  },

  emits: ['close', 'save'],

  setup(_, { emit }) {
    const loading = ref(false);
    const categoryStore = useCategoryStore();
    const productStore = useProductStore();
    const { categories } = categoryStore;
    const fileInput = ref<HTMLInputElement | null>(null);
    const selectedFile = ref<File | null>(null);
    const imageName = ref('');
    const uploadInProgress = ref(false);
    const imageError = ref('');

    // Initialize component before mounting
    onBeforeMount(async () => {
      // Reset form
      resetForm();

      // Ensure categories are loaded
      if (categories.length === 0) {
        await categoryStore.fetchCategories();
      }
    });

    const productForm = ref<Product>({
      id: 0, // Changed from undefined to 0 to satisfy Product type
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
        id: 0, // Changed from undefined to 0
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

    // Handle file selection
    const handleFileSelection = (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (!input.files || input.files.length === 0) return;

      selectedFile.value = input.files[0];
      imageName.value = input.files[0].name.split('.')[0]; // Use filename without extension as default image name
      imageError.value = '';
    };

    // Upload the selected image
    const uploadImage = async () => {
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

        productForm.value.slika_url = imageUrl;
        selectedFile.value = null;
        imageName.value = '';
      } catch (error: any) {
        console.error('Error uploading image:', error);
        imageError.value = error.message || 'Greška prilikom otpremanja slike';
      } finally {
        uploadInProgress.value = false;
      }
    };

    // Remove the uploaded image
    const removeImage = () => {
      productForm.value.slika_url = '';
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

    // Get image preview URL
    const getImagePreview = (url: string) => {
      if (!url) return '';

      // If it's already an absolute URL starting with http, return as is
      if (url.startsWith('http')) return url;

      // If it's a relative URL starting with /nexton/api/uploads
      if (url.startsWith('/nexton/api/uploads')) {
        return `http://localhost:8080${url}`;
      }

      // Otherwise, assume it's just a filename and add the full path
      return `http://localhost:8080/nexton/api/uploads/${url}`;
    };

    return {
      loading,
      productForm,
      fileInput,
      selectedFile,
      imageName,
      uploadInProgress,
      imageError,
      resetForm,
      closeModal,
      handleSubmit,
      categories,
      handleFileSelection,
      uploadImage,
      removeImage,
      getImagePreview
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
  z-index: 2000;
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
  /* Adjust font size */
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background-color: #e2e8f0;
  color: #475569;
  border: none;
}

.submit-btn {
  background-color: #6366f1;
  color: white;
  border: none;
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

.image-upload-container {
  margin-bottom: 1rem;
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
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
