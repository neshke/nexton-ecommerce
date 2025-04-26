import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Category } from "@/models";

import { API_URLS } from "@/config/api";
import axiosInstance from "@/config/axios";

export const useCategoryStore = defineStore("categories", () => {
  // ---------- STATE ----------
  const categories = ref<Category[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Save state to localStorage
  const saveToLocalStorage = () => {
    localStorage.setItem("categories", JSON.stringify(categories.value));
  };

  // Initialize store from localStorage or fetch
  const initializeStore = async () => {
    const savedCategories = localStorage.getItem("categories");

    if (savedCategories) {
      categories.value = JSON.parse(savedCategories);
    } else {
      await fetchCategories();
    }
  };

  // ---------- GETTERS ----------
  const getCategories = computed(() => categories.value);
  
  const getCategoryById = computed(() => (id: number) => {
    return categories.value.find(category => category.id === id) || null;
  });
  
  const getCategoryNameById = computed(() => (id: number) => {
    const category = categories.value.find(category => category.id === id);
    return category ? category.naziv : 'Uncategorized';
  });

  // ---------- ACTIONS ----------
  async function fetchCategories(): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const response = await axiosInstance.get(API_URLS.CATEGORIES.READ);

      if (!response || !response.data) {
        throw new Error("No response received from server");
      }

      if (response.data.status === 200 && Array.isArray(response.data.data)) {
        console.log("Fetched categories:", response.data.data);
        categories.value = response.data.data;
        saveToLocalStorage();
      } else {
        throw new Error(response.data?.message || "Failed to fetch categories");
      }
    } catch (err: any) {
      error.value = err?.message || "Failed to fetch categories";
      console.error("Error fetching categories:", err);
    } finally {
      loading.value = false;
    }
  }

  // Initialize store when created
  initializeStore();

  return {
    // state
    categories,
    loading,
    error,
    // getters
    getCategories,
    getCategoryById,
    getCategoryNameById,
    // actions
    fetchCategories,
    // utility
    initializeStore,
  };
});