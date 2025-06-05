<template>
  <div class="product-card" :class="{ 'list-view': viewMode === 'list' }" @click="showQuickView">
    <div class="product-image">
      <img :src="product.slika_url || defaultImage" :alt="product.naziv" @error="handleImageError" />
      <div class="product-badges">
        <span v-if="isNew" class="badge new">Novo</span>
      </div>
      <div v-if="isAdmin" class="admin-controls">
        <button @click.stop="openEditModal" title="Izmeni proizvod">
          <i class="fas fa-edit"></i>
        </button>
        <button @click.stop="handleDelete" title="Obriši proizvod">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
    <div class="product-info">
      <div class="product-category" v-if="categoryName">{{ categoryName }}</div>
      <h3 class="product-title">
        <router-link :to="{ name: 'ProductDetail', params: { id: product.id } }">
          {{ product.naziv }}
        </router-link>
      </h3>
      <div class="product-price">
        <span class="current-price">{{ formatPrice(product.cena) }}</span>
      </div>
      <div class="product-description" v-if="viewMode === 'list' && product.opis">
        {{ truncateDescription(product.opis, 150) }}
      </div>
      <div class="product-actions">
        <button class="add-to-cart" @click.stop="addToCart">
          <span class="icon"><i class="fas fa-shopping-cart"></i></span>
          <span class="text">Dodaj u korpu</span>
        </button>
      </div>
    </div>
  </div>
  <EditProductFormModal :show="isEditModalVisible" :product="selectedProductForEdit" @close="closeEditModal"
    @save="handleProductUpdate" />
</template>

<script lang="ts">
import { computed, ref, defineComponent } from "vue";
import type { PropType } from "vue";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { useCategoryStore } from "@/stores/categoryStore";
import { useProductStore } from "@/stores/productStore";
import type { Product } from "@/models";
import EditProductFormModal from "@/components/Products/EditProductFormModal.vue";
import { useNotification } from "@/utils/notifications";

export default defineComponent({
  name: 'ProductCard',
  props: {
    product: {
      type: Object as PropType<Product>,
      required: true,
    },
    viewMode: {
      type: String,
      default: "grid",
    },
  },
  components: {
    EditProductFormModal,
  },
  emits: ["show-quick-view", "product-deleted", "view-product", "add-to-cart", "product-updated"],
  setup(props, { emit }) {
    const cartStore = useCartStore();
    const authStore = useAuthStore();
    const categoryStore = useCategoryStore();
    const productStore = useProductStore();
    const { showNotification } = useNotification();

    const defaultImage = "/images/product-placeholder.png";
    const imageError = ref(false);
    const isEditModalVisible = ref(false);
    const selectedProductForEdit = ref<Product | null>(null);

    const isAdmin = computed(() => authStore.isAdmin);

    const categoryName = computed(() => {
      if (props.product.kategorija_id) {
        return categoryStore.getCategoryNameById(props.product.kategorija_id);
      }
      return null;
    });

    const isNew = computed(() => {
      if (!props.product.kreirano_at) return false;
      const createdDate = new Date(props.product.kreirano_at);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - createdDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 14;
    });

    const formatPrice = (price: number | undefined): string => {
      if (price === undefined || price === null) return "Nije dostupno";
      return new Intl.NumberFormat("sr-RS", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2, // Ensure two decimal places for currency
        maximumFractionDigits: 2,
      }).format(price);
    };

    const truncateDescription = (text: string | undefined, length: number): string => {
      if (!text) return '';
      if (text.length <= length) return text;
      return text.substring(0, length) + "...";
    };

    const handleImageError = () => {
      imageError.value = true;
    };

    const addToCart = () => {
      cartStore.addToCart({ product: props.product, quantity: 1 });
      showNotification(`${props.product.naziv} je dodat u korpu.`, "success");
    };

    const showQuickView = (event: MouseEvent) => {
      // Prevent quick view if the click is on an admin control button
      const target = event.target as HTMLElement;
      if (target.closest('.admin-controls')) {
        return;
      }
      emit("view-product", props.product);
    };

    const openEditModal = () => {
      selectedProductForEdit.value = JSON.parse(JSON.stringify(props.product));
      isEditModalVisible.value = true;
    };

    const closeEditModal = () => {
      isEditModalVisible.value = false;
      selectedProductForEdit.value = null;
    };

    const handleProductUpdate = (updatedProduct: Product) => {
      emit("product-updated", updatedProduct);
      closeEditModal();
    };

    const handleDelete = async () => {
      if (confirm('Da li ste sigurni da želite da obrišete ovaj proizvod?')) {
        try {
          if (props.product.id === undefined) {
            showNotification("ID proizvoda nije definisan.", "error");
            return;
          }
          await productStore.deleteProduct(props.product.id);
          emit("product-deleted", props.product.id);
          showNotification("Proizvod je uspešno obrisan!", "success");
        } catch (error: any) {
          console.error("Error deleting product:", error);
          showNotification(error.message || "Greška prilikom brisanja proizvoda.", "error");
        }
      }
    };

    return {
      defaultImage,
      imageError,
      categoryName,
      isNew,
      isAdmin,
      formatPrice,
      truncateDescription,
      handleImageError,
      addToCart,
      showQuickView,
      handleDelete,
      isEditModalVisible,
      selectedProductForEdit,
      openEditModal,
      closeEditModal,
      handleProductUpdate,
    };
  },
});
</script>

<style scoped>
.product-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.product-card:hover:not(.admin-interaction) {
  /* Apply hover effect only if not interacting with admin controls */
  cursor: pointer;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}

.product-image {
  position: relative;
  width: 100%;
  padding-top: 75%;
  overflow: hidden;
  background-color: #f9fafb;
  cursor: pointer;
}

.product-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  /* Default for all product images */
  transition: transform 0.5s ease;
  display: block;
  /* Add display: block */
}

.product-card.list-view .product-image {
  width: 200px;
  min-width: 200px;
  /* Ensure it doesn't shrink below this */
  height: 200px;
  padding-top: 0;
  /* Override aspect ratio padding from grid view */
  position: relative;
  overflow: hidden;
  background-color: #fff;
  /* Ensure no transparent background shows underlying elements */
}

.product-card.list-view .product-image img {
  object-fit: contain;
  /* Ensure images in list view are contained */
  /* width and height 100% are inherited and will scale the image within the container */
}

.product-badges {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge.new {
  background-color: #10b981;
  color: white;
}

.badge.sale {
  background-color: #ef4444;
  color: white;
}

.admin-controls {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 5;
}

.admin-controls button {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #4b5563;
}

.admin-controls button:hover {
  background-color: white;
  transform: scale(1.1);
}

.admin-controls button:first-child:hover {
  color: #3b82f6;
}

.admin-controls button:last-child:hover {
  color: #ef4444;
}

.product-info {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
}

.product-category {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.product-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
}

.product-title a {
  color: #1f2937;
  text-decoration: none;
  transition: color 0.3s;
}

.product-title a:hover {
  color: #6366f1;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 8px;
}

.current-price {
  font-weight: 600;
  font-size: 1.125rem;
  color: #1f2937;
}

.old-price {
  font-size: 0.875rem;
  text-decoration: line-through;
  color: #9ca3af;
}

.product-description {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
  margin-top: 0.5rem;
}

.product-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}

.product-actions button {
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.add-to-cart {
  flex: 1;
  background-color: #6366f1;
  color: white;
}

.add-to-cart:hover {
  background-color: #4f46e5;
}

.quick-view {
  background-color: #f3f4f6;
  color: #4b5563;
  width: 40px;
  padding: 0.5rem;
}

.quick-view .text {
  display: none;
}

.quick-view:hover {
  background-color: #e5e7eb;
  color: #1f2937;
}

/* List view styles */
.product-card.list-view {
  flex-direction: row;
  align-items: center;
  gap: 1.5rem;
}

.product-card.list-view .product-image {
  width: 200px;
  min-width: 200px;
  height: 200px;
  padding-top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #eee;
}

.product-card.list-view .product-image img {
  position: relative;
  object-fit: contain;
  max-height: 100%;
  max-width: 100%;
}

.product-card.list-view .product-info {
  flex: 1;
  padding: 1rem;
}

.product-card.list-view .product-title {
  font-size: 1.1rem;
}

.product-card.list-view .product-description {
  font-size: 0.85rem;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
}

.product-card.list-view .product-actions {
  margin-top: auto;
  flex-direction: row;
  gap: 0.75rem;
}

.product-card.list-view .add-to-cart {
  flex: initial;
  padding: 0.5rem 1rem;
}

@media (max-width: 768px) {
  .product-card.list-view {
    flex-direction: column;
  }

  .product-card.list-view .product-image {
    width: 100%;
    padding-top: 75%;
    height: auto;
  }

  .product-card.list-view .product-info {
    width: 100%;
  }

  .product-card.list-view .product-title {
    font-size: 1rem;
  }

  .quick-view {
    display: none;
  }
}
</style>
