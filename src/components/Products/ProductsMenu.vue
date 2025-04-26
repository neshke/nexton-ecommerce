<template>
  <div class="products-menu">
    <div class="menu-container">
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
                <div v-for="category in categoryStore.categories" :key="category.id" class="category-option">
                  <input type="checkbox" :id="`category-${category.id}`" :value="category.id"
                    v-model="selectedCategories" @change="applyFilters" />
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
</template>

<script lang="ts">
import { ref, watch, onMounted } from "vue";
import type { FilterOptions } from "@/models";
import { useCategoryStore } from "@/stores/categoryStore";

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

  emits: ["sort-change", "view-change", "filter-change"],

  setup(props, { emit }) {
    // Get category store
    const categoryStore = useCategoryStore();

    // Reactive state
    const currentSort = ref<string>(props.initialSort);
    const viewMode = ref<string>(props.initialView);
    const showFilters = ref<boolean>(false);
    const minPrice = ref<string>("");
    const maxPrice = ref<string>("");
    const selectedCategories = ref<number[]>([]);

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
        categories: selectedCategories.value.length > 0 ? selectedCategories.value : null,
      };

      emit("filter-change", filters);
    };

    const applyPriceFilter = () => {
      applyFilters();
    };

    const resetFilters = () => {
      minPrice.value = "";
      maxPrice.value = "";
      selectedCategories.value = [];
      applyFilters();
    };

    // Return everything that needs to be accessible in the template
    return {
      sortOptions,
      currentSort,
      viewMode,
      showFilters,
      minPrice,
      maxPrice,
      selectedCategories,
      categoryStore,
      handleSortChange,
      handleViewChange,
      applyPriceFilter,
      applyFilters,
      resetFilters,
    };
  },
};
</script>

<style scoped>
.products-menu {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  padding: 1rem;
  position: sticky;
  top: 80px;
  z-index: 10;
  width: 100%;
  max-width: 100%;
}

.menu-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.top-menu {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

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

.category-option input[type="checkbox"] {
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
  .top-menu {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .sort-options {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }

  .sort-options select {
    width: 100%;
    min-width: unset;
  }

  .view-options {
    align-self: flex-end;
  }

  .price-inputs {
    flex-direction: column;
    gap: 0.5rem;
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
