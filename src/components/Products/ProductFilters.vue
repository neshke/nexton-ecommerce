<template>
  <div class="filters-container">
    <!-- Mobile Filter Toggle Button -->
    <button class="filter-toggle" @click="toggleFilters">
      <i class="fas fa-filter"></i> Filteri
      <i :class="isFilterOpen ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
    </button>

    <!-- Filters Panel -->
    <div class="filters-panel" :class="{ open: isFilterOpen }">
      <!-- Search Box -->
      <div class="filter-group">
        <label for="search">Pretraga</label>
        <div class="search-box">
          <input type="text" id="search" v-model="searchTerm" placeholder="Pretraži proizvode..." />
          <i class="fas fa-search search-icon"></i>
        </div>
      </div>

      <!-- Categories Filter -->
      <div class="filter-group">
        <label>Kategorije</label>
        <div class="categories-list">
          <button class="category-item" :class="{ active: selectedCategory === null }" @click="selectCategory(null)">
            Sve kategorije
          </button>
          <button v-for="category in categoriesWithCount" :key="category.id" class="category-item"
            :class="{ active: selectedCategory === category.id }" @click="selectCategory(category.id)">
            {{ category.naziv }}
            <span class="count">({{ category.productCount }})</span>
          </button>
        </div>
      </div>

      <!-- Price Range Filter -->
      <div class="filter-group">
        <label>Cenovni raspon</label>
        <div class="price-range">
          <input type="number" v-model.number="minPrice" placeholder="Min" min="0" />
          <span>-</span>
          <input type="number" v-model.number="maxPrice" placeholder="Max" min="0" />
        </div>
      </div>

      <!-- Sort By Filter -->
      <div class="filter-group">
        <label>Sortiraj po</label>
        <div class="sort-options">
          <div class="dropdown">
            <button class="dropdown-toggle">
              {{ selectedSortLabel }}
              <i class="fas fa-chevron-down"></i>
            </button>
            <div class="dropdown-menu">
              <button v-for="option in sortOptions" :key="option.value" class="dropdown-item"
                :class="{ active: sortBy === option.value }" @click="selectSortOption(option.value)">
                {{ option.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter Actions (Reset & Apply on mobile) -->
      <div class="filter-actions">
        <button class="reset-btn" @click="resetFilters">
          Resetuj
        </button>
        <button class="apply-btn" @click="applyFilters">
          Primeni
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed, watch } from "vue";
import type { Product, Category } from "@/models";

export default {
  name: "ProductFilters",
  props: {
    categories: {
      type: Array as () => Category[],
      default: () => ([])
    },
    products: {
      type: Array as () => Product[],
      default: () => ([])
    }
  },
  emits: ["update-filters"],
  setup(props, { emit }) {
    // Definisanje stanja filtera
    const searchTerm = ref("");
    const selectedCategory = ref<number | null>(null);
    const minPrice = ref<number | null>(null);
    const maxPrice = ref<number | null>(null);
    const sortBy = ref("name-asc");
    const isFilterOpen = ref(false); // Za mobilni prikaz

    // Izračunate kategorije sa brojanjem proizvoda
    const categoriesWithCount = computed(() => {
      return props.categories.map(cat => {
        // Count products that belong to this category
        const productCount = props.products.filter(product => product.kategorija_id === cat.id).length;
        return {
          ...cat,
          productCount
        };
      });
    });

    // Naziv izabrane kategorije
    const selectedCategoryName = computed(() => {
      if (!selectedCategory.value) return "Sve kategorije";
      const category = categoriesWithCount.value.find(
        cat => cat.id === selectedCategory.value
      );
      return category ? category.naziv : "Sve kategorije";
    });

    // Opcije za sortiranje
    const sortOptions = [
      { value: "name-asc", label: "Naziv (A-Z)" },
      { value: "name-desc", label: "Naziv (Z-A)" },
      { value: "price-asc", label: "Cena (najniža prvo)" },
      { value: "price-desc", label: "Cena (najviša prvo)" }
    ];

    // Naziv izabrane opcije za sortiranje
    const selectedSortLabel = computed(() => {
      const option = sortOptions.find(opt => opt.value === sortBy.value);
      return option ? option.label : "Naziv (A-Z)";
    });

    // Funkcija za resetovanje filtera
    const resetFilters = () => {
      searchTerm.value = "";
      selectedCategory.value = null;
      minPrice.value = null;
      maxPrice.value = null;
      sortBy.value = "name-asc";
    };

    // Funkcija za slanje podataka o filterima roditeljskoj komponenti
    const emitFilters = () => {
      emit("update-filters", {
        searchTerm: searchTerm.value,
        categoryId: selectedCategory.value,
        minPrice: minPrice.value,
        maxPrice: maxPrice.value,
        sortBy: sortBy.value
      });
    };

    // Funkcija za slanje filtera prilikom promene vrednosti
    const applyFilters = () => {
      emitFilters();
      if (window.innerWidth < 768) {
        isFilterOpen.value = false; // Zatvori filter panel na mobilnim uređajima
      }
    };

    // Funkcija za prikazivanje/sakrivanje filtera na mobilnim uređajima
    const toggleFilters = () => {
      isFilterOpen.value = !isFilterOpen.value;
    };

    // Funkcija za izbor kategorije
    const selectCategory = (categoryId: number | null) => {
      if (selectedCategory.value === categoryId) {
        selectedCategory.value = null; // Odznači ako je već izabrana
      } else {
        selectedCategory.value = categoryId;
      }
    };

    // Funkcija za izbor opcije sortiranja
    const selectSortOption = (option: string) => {
      sortBy.value = option;
    };

    // Praćenje promena na filterima i emitovanje događaja
    watch(
      [searchTerm, selectedCategory, minPrice, maxPrice, sortBy],
      () => {
        emitFilters();
      },
      { deep: true }
    );

    return {
      searchTerm,
      selectedCategory,
      minPrice,
      maxPrice,
      sortBy,
      isFilterOpen,
      categoriesWithCount,
      selectedCategoryName,
      sortOptions,
      selectedSortLabel,
      resetFilters,
      applyFilters,
      toggleFilters,
      selectCategory,
      selectSortOption
    };
  }
}
</script>

<style scoped>
.filters-container {
  margin-bottom: 2rem;
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.filter-toggle {
  display: none;
  width: 100%;
  padding: 0.8rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-group {
  margin-bottom: 1.5rem;
}

.filter-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #4b5563;
}

.search-box {
  position: relative;
}

.search-box input {
  width: 100%;
  padding: 0.8rem;
  padding-right: 2.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  transition: border-color 0.2s;
}

.search-box input:focus {
  border-color: #6366f1;
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.search-icon {
  position: absolute;
  right: 0.8rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.categories-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.category-item {
  display: flex;
  justify-content: space-between;
  padding: 0.6rem;
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.category-item:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.category-item.active {
  background: #eef2ff;
  border-color: #6366f1;
  color: #6366f1;
}

.count {
  color: #9ca3af;
  font-size: 0.9rem;
}

.price-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.price-range input {
  padding: 0.5rem;
  width: calc(50% - 0.5rem);
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.price-range span {
  display: block;
  margin: 0 0.2rem;
}

.dropdown {
  position: relative;
}

.dropdown-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0.8rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.dropdown-toggle:hover {
  border-color: #d1d5db;
}

.dropdown:focus-within .dropdown-menu {
  display: block;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-top: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  z-index: 10;
  display: none;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.6rem 0.8rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #f3f4f6;
}

.dropdown-item.active {
  background: #eef2ff;
  color: #6366f1;
}

.filter-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.reset-btn {
  padding: 0.8rem 1.2rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.reset-btn:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.apply-btn {
  padding: 0.8rem 1.2rem;
  background: #6366f1;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: white;
  font-weight: 600;
  transition: all 0.2s;
}

.apply-btn:hover {
  background: #4f46e5;
}

@media (max-width: 768px) {
  .filter-toggle {
    display: flex;
  }

  .filters-panel {
    display: none;
    margin-top: 1rem;
  }

  .filters-panel.open {
    display: block;
    animation: slideDown 0.3s ease-out;
  }
}

/* Custom scrollbar for category list */
.categories-list::-webkit-scrollbar {
  width: 4px;
}

.categories-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.categories-list::-webkit-scrollbar-thumb {
  background: #c5c7d0;
  border-radius: 10px;
}

.categories-list::-webkit-scrollbar-thumb:hover {
  background: #a8a9b4;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>