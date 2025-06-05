<template>
  <div class="products-menu">
    <button class="mobile-filter-toggle" @click="toggleMobileMenu">
      <i class="fas fa-bars"></i> Filteri i Sortiranje
    </button>
    <div class="menu-container" :class="{ 'mobile-menu-open': isMobileMenuOpen }">
      <div class="top-menu">
        <div class="filter-section">
          <h3>Sortiraj po</h3>
          <div class="sort-options">
            <select v-model="currentSort" @change="handleSortChange">
              <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="view-options">
          <button :class="{ active: viewMode === 'grid' }" @click="handleViewChange('grid')" title="Prikaz Mreže">
            <span class="icon">
              <i class="fas fa-th"></i>
            </span>
          </button>
          <button :class="{ active: viewMode === 'list' }" @click="handleViewChange('list')" title="Prikaz Liste">
            <span class="icon">
              <i class="fas fa-list"></i>
            </span>
          </button>
        </div>
      </div>

      <!-- Filter options -->
      <div class="filter-options">
        <div class="filter-toggle" @click="showFilters = !showFilters">
          <h3>Filteri</h3>
          <button class="toggle-icon" :class="{ 'rotate': showFilters }">{{ showFilters ? "−" : "+" }}</button>
        </div>

        <transition name="filters">
          <div v-if="showFilters" class="filters-container">
            <!-- Price Range Filter -->
            <div class="filter-group">
              <h4>Opseg cena</h4>
              <div class="price-inputs">
                <div class="price-input">
                  <label>Min</label>
                  <input type="number" v-model="minPrice" @change="applyPriceFilter" placeholder="Min" min="0" />
                </div>
                <div class="price-input">
                  <label>Maks</label>
                  <input type="number" v-model="maxPrice" @change="applyPriceFilter" placeholder="Max" min="0" />
                </div>
              </div>
            </div>

            <!-- Categories Filter -->
            <div class="filter-group" v-if="categoryStore.categories.length > 0">
              <h4>Kategorije</h4>
              <div class="category-options">
                <div class="category-option">
                  <input type="radio" id="category-all" :value="null" v-model="selectedCategory"
                    @change="applyFilters" />
                  <label for="category-all">Sve kategorije</label>
                </div>
                <div v-for="category in categoryStore.categories" :key="category.id" class="category-option">
                  <input type="radio" :id="`category-${category.id}`" :value="category.id" v-model="selectedCategory"
                    @change="applyFilters" />
                  <label :for="`category-${category.id}`">{{ category.naziv }}</label>
                </div>
              </div>
            </div>

            <!-- Reset Filters -->
            <button class="reset-filters" @click="resetFilters">
              Resetuj filtere
            </button>
          </div>
        </transition>
      </div>
    </div>
  </div>
  <!-- ProductFormModal removed -->
</template>

<script lang="ts">
import { ref, watch, onMounted } from "vue";
import type { FilterOptions } from "@/models";
import { useCategoryStore } from "@/stores/categoryStore";
// import { useAuthStore } from "@/stores/authStore"; // Removed authStore import
// import ProductFormModal from "./ProductFormModal.vue"; // Removed ProductFormModal import

// Define available sort options
const sortOptions = [
  { label: "Najnovije", value: "latest" },
  { label: "Cena: rastuće", value: "price-asc" },
  { label: "Cena: opadajuće", value: "price-desc" },
  { label: "Naziv: A do Š", value: "name-asc" },
  { label: "Naziv: Š do A", value: "name-desc" },
];

export default {
  props: {
    initialSort: {
      type: String,
      default: "name-asc",
    },
    initialView: {
      type: String,
      default: "grid",
    },
  },

  emits: ["sort-change", "view-change", "filters-changed"], // Removed "refresh-products"

  setup(props, { emit }) {
    // Get category store
    const categoryStore = useCategoryStore();
    const isMobileMenuOpen = ref(false);

    // Reactive state
    const currentSort = ref<string>(props.initialSort);
    const viewMode = ref<string>(props.initialView);
    const showFilters = ref<boolean>(false);
    const minPrice = ref<string>("");
    const maxPrice = ref<string>("");
    const selectedCategory = ref<number | null>(null);
    // Watch for prop changes
    watch(
      () => props.initialSort,
      (newVal) => {
        currentSort.value = newVal;
      },
      { immediate: true }
    );

    watch(
      () => props.initialView,
      (newVal) => {
        viewMode.value = newVal;
      }
    );

    // Fetch categories on component mount
    onMounted(async () => {
      if (categoryStore.categories.length === 0) {
        await categoryStore.fetchCategories();
      }
    });

    // Methods
    const handleSortChange = () => {
      emit("sort-change", currentSort.value);
    };

    const handleViewChange = (view: string) => {
      viewMode.value = view;
      emit("view-change", view);
    };

    const applyFilters = () => {
      const filters: FilterOptions = {
        minPrice: minPrice.value ? Number(minPrice.value) : null,
        maxPrice: maxPrice.value ? Number(maxPrice.value) : null,
        categories: selectedCategory.value ? [selectedCategory.value] : null,
      };

      emit("filters-changed", filters); // Changed from "filter-change" to "filters-changed"
    };

    const applyPriceFilter = () => {
      applyFilters();
    };

    const resetFilters = () => {
      minPrice.value = "";
      maxPrice.value = "";
      selectedCategory.value = null;
      applyFilters();
      if (window.innerWidth < 768) { // Close mobile menu on reset if open
        isMobileMenuOpen.value = false;
      }
    };

    const toggleMobileMenu = () => {
      isMobileMenuOpen.value = !isMobileMenuOpen.value;
    };

    // Removed openProductFormModal, closeProductFormModal, handleProductAdded methods

    // Return everything that needs to be accessible in the template
    return {
      sortOptions,
      currentSort,
      viewMode,
      showFilters,
      minPrice,
      maxPrice,
      selectedCategory,
      categoryStore,
      isMobileMenuOpen, // Added for mobile menu state
      // authStore, // Removed authStore from return
      // isProductFormModalVisible, // Removed modal state from return
      handleSortChange,
      handleViewChange,
      applyPriceFilter,
      applyFilters,
      resetFilters,
      toggleMobileMenu, // Added for mobile menu toggle
      // openProductFormModal, // Removed method from return
      // closeProductFormModal, // Removed method from return
      // handleProductAdded, // Removed method from return
    };
  },
};
</script>

<style scoped>
.products-menu {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 1rem;
  /* Reduced margin-bottom */
  padding: 1rem;
  position: sticky;
  top: 80px;
  /* Adjust if you have a fixed header, otherwise can be 0 or a smaller value */
  z-index: 10;
  width: 100%;
  /* max-width: 100%; */
  /* Can be removed if width: 100% is desired */
  /* position: relative; */
  /* This was for mobile button, but sticky handles positioning context too */
}

.mobile-filter-toggle {
  display: none;
  /* Hidden by default */
  background-color: #6366f1;
  color: white;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  /* margin-bottom: 1rem; */
  /* Removed as menu itself has margin */
  width: 100%;
  text-align: left;
  margin-bottom: 0;
  /* Ensure no extra space when menu is collapsed */
}

.mobile-filter-toggle i {
  margin-right: 0.5rem;
}

.menu-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: max-height 0.3s ease-out, padding 0.3s ease-out, margin-top 0.3s ease-out;
  /* Added padding and margin-top transition */
  /* Default state for desktop - always visible */
}

.top-menu {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

/* Removed .admin-actions styles */

.filter-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-section h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: #4b5563;
}

.sort-options {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.sort-options select {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #4b5563;
  transition: all 0.2s;
  min-width: 180px;
  appearance: auto;
}

.sort-options select:hover {
  border-color: #6366f1;
}

.sort-options select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.view-options {
  display: flex;
  gap: 0.5rem;
}

.view-options button {
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 0.5rem;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.view-options button:hover {
  background-color: #f3f4f6;
}

.view-options button.active {
  background-color: #6366f1;
  color: white;
  border-color: #6366f1;
}

/* Filter options styling */
.filter-options {
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
}

.filter-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 0.5rem 0;
}

.filter-toggle h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: #4b5563;
}

.toggle-icon {
  font-size: 1.5rem;
  color: #6366f1;
  font-weight: bold;
  transition: transform 0.3s ease;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.toggle-icon:focus {
  outline: none;
}

.toggle-icon.rotate {
  transform: rotate(180deg);
}

.filters-container {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  transform-origin: top;
}

/* Filters animation */
.filters-enter-active,
.filters-leave-active {
  transition: all 0.4s ease;
  max-height: 500px;
  opacity: 1;
  overflow: hidden;
}

.filters-enter-from,
.filters-leave-to {
  max-height: 0;
  opacity: 0;
  margin-top: 0;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filter-group h4 {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0;
  color: #4b5563;
}

.price-inputs {
  display: flex;
  gap: 1rem;
}

.price-input {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.price-input label {
  font-size: 0.8rem;
  color: #6b7280;
}

.price-input input {
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
}

.category-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.category-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.category-option input[type="radio"] {
  accent-color: #6366f1;
}

.category-option label {
  font-size: 0.9rem;
  color: #4b5563;
  cursor: pointer;
}

.reset-filters {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  color: #4b5563;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
  align-self: flex-start;
}

.reset-filters:hover {
  background: #e5e7eb;
  color: #1f2937;
}

@media (max-width: 1200px) {
  .sort-options select {
    min-width: 160px;
  }
}

@media (max-width: 768px) {
  .products-menu {
    padding: 0.5rem;
    /* Adjust padding for mobile */
    margin-bottom: 0.5rem;
    top: 70px;
    /* Example: if header is smaller on mobile */
  }

  .mobile-filter-toggle {
    display: flex;
    /* Changed to flex for better icon alignment */
    align-items: center;
    /* Align icon and text */
  }

  .menu-container {
    /* position: absolute; */
    /* Removed absolute positioning */
    /* top: calc(100% + 5px); */
    /* No longer needed */
    /* left: 0; */
    /* right: 0; */
    /* z-index: 999; */
    /* No longer needed here, parent .products-menu has z-index */
    background-color: #fff;
    /* Keep background */
    /* border: 1px solid #e2e8f0; */
    /* Border can be on .products-menu or here */
    /* border-radius: 6px; */
    /* box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); */
    /* Shadow can be on .products-menu */
    max-height: 0;
    overflow: hidden;
    padding: 0 1rem;
    /* Horizontal padding when closed, vertical will be 0 */
    margin-top: 0;
    /* No margin when closed */
    border-top: 1px solid #e2e8f0;
    /* Add a separator line when closed */
  }

  .menu-container.mobile-menu-open {
    max-height: 100vh;
    /* Adjust as needed */
    overflow-y: auto;
    padding: 1rem;
    /* Padding when open */
    margin-top: 0.5rem;
    /* Add some space from the toggle button */
    border-top: none;
    /* Remove separator line when open */
  }

  .top-menu {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-section,
  .view-options {
    width: 100%;
    margin-bottom: 1rem;
  }

  .view-options {
    justify-content: flex-start;
  }
}

@media (max-width: 480px) {
  .products-menu {
    padding: 0.75rem;
  }

  .view-options button {
    width: 2rem;
    height: 2rem;
  }
}
</style>
