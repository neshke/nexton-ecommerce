import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Product } from "@/models";

import { API_URLS } from "@/config/api";
import axiosInstance from "@/config/axios";

export const useProductStore = defineStore("products", () => {
  // ---------- STATE ----------
  const products = ref<Product[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Save state to localStorage
  const saveToLocalStorage = () => {
    localStorage.setItem("products", JSON.stringify(products.value));
  };

  // Initialize store from localStorage or fetch
  const initializeStore = async () => {
    const savedProducts = localStorage.getItem("products");

    if (savedProducts) {
      products.value = JSON.parse(savedProducts);
    } else {
      await fetchProducts();
    }
  };

  // ---------- GETTERS ----------
  const getProducts = computed(() => products.value);
  
  // ---------- SETTERS ----------
  const setProducts = (productList: Product[]) => {
    products.value = productList;
    saveToLocalStorage();
  };

  // ---------- ACTIONS ----------
  async function fetchProducts(): Promise<void> {
    
    loading.value = true;
    error.value = null;

    try {
      const response = await axiosInstance.get(API_URLS.PRODUCTS.READ);

      if (!response || !response.data) {
        throw new Error("No response received from server");
      }

      if (response.data.status === 200 && Array.isArray(response.data.data)) {
        console.log("Fetched products:");
        const processedProducts = response.data.data.map((item: any) => {
          // Fix image URL if needed
          if (item.slika_url && !item.slika_url.startsWith('http')) {
            const filename = item.slika_url.split('/').pop();
            item.slika_url = `${API_URLS.UPLOADS}${filename}`;
          }
          
          return item;
        });
        
        setProducts(processedProducts);
      } else {
        throw new Error(response.data?.message || "Failed to fetch products");
      }
    } catch (err: any) {
      console.log("Error fetching products:", err);
      error.value = err?.message || "Failed to fetch products";
      console.error("Error fetching products:", err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchProductById(id: number): Promise<Product | null> {
    
    if (!id) {
      error.value = "Invalid product ID";
      return null;
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await axiosInstance.get(
        `${API_URLS.PRODUCTS.READ}?id=${id}`
      );

      if (!response || !response.data) {
        throw new Error("No response received from server");
      }

      if (response.data.status === 200 && response.data.data) {
        // Fix image URL if needed
        if (response.data.data.slika_url && !response.data.data.slika_url.startsWith('http')) {
          const filename = response.data.data.slika_url.split('/').pop();
          response.data.data.slika_url = `${API_URLS.UPLOADS}${filename}`;
        }
        console.log("Fetched product:", response.data.data);
        return response.data.data;
      }

      return null;
    } catch (err: any) {
      error.value = err?.message || "Failed to fetch product";
      console.error(`Error fetching product ${id}:`, err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  // async function uploadImage(file: File): Promise<string> {
    
  //   if (!file) {
  //     error.value = "No file provided";
  //     throw new Error(error.value);
  //   }

  //   loading.value = true;

  //   try {
  //     const formData = new FormData();
  //     formData.append("image", file);

  //     const response = await axiosInstance.post(
  //       API_URLS.PRODUCTS.UPLOAD_IMAGE,
  //       formData,
  //       { headers: { "Content-Type": "multipart/form-data" } }
  //     );

  //     if (!response || !response.data) {
  //       throw new Error("No response received from server");
  //     }

  //     if (response.data.status === "success" && response.data.data?.filename) {
  //       return `${API_URLS.BASE}${response.data.data.filename}`;
  //     }

  //     throw new Error(response.data?.message || "Failed to upload image");
  //   } catch (err: any) {
  //     error.value = err?.message || "Failed to upload image";
  //     console.error("Error uploading image:", err);
  //     throw err;
  //   } finally {
  //     loading.value = false;
  //   }
  // }

  async function createProduct(product: Omit<Product, "id">): Promise<Product> {
    
    if (!product) {
      error.value = "No product data provided";
      throw new Error(error.value);
    }

    loading.value = true;

    try {
      const response = await axiosInstance.post(
        API_URLS.PRODUCTS.CREATE,
        product
      );

      if (!response || !response.data) {
        throw new Error("No response received from server");
      }

      if (response.data.status === 201 && response.data.data) {
        const serverProduct = response.data.data;
        
        // Fix image URL if needed
        if (serverProduct.slika_url && !serverProduct.slika_url.startsWith('http')) {
          serverProduct.slika_url = `${API_URLS.BASE}${serverProduct.slika_url}`;
        }
        
        // Add the new product to our local state
        products.value.push(serverProduct);
        saveToLocalStorage();
        
        return serverProduct;
      }

      throw new Error(response.data?.message || "Failed to create product");
    } catch (err: any) {
      error.value = err?.message || "Failed to create product";
      console.error("Error creating product:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteProduct(id: number): Promise<boolean> {
    
    if (!id) {
      error.value = "Invalid product ID";
      throw new Error(error.value);
    }

    loading.value = true;

    try {
      // Import authStore to get the token
      const { useAuthStore } = await import('@/stores/authStore');
      const authStore = useAuthStore();
      const token = authStore.getToken();

      if (!token) {
        throw new Error("Authentication required to delete products");
      }

      const response = await axiosInstance.delete(
        `${API_URLS.PRODUCTS.DELETE}?id=${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response || !response.data) {
        throw new Error("No response received from server");
      }

      if (response.data.status === 200) {
        // Remove the deleted product from our local state
        const index = products.value.findIndex(p => p.id === id);
        if (index !== -1) {
          products.value.splice(index, 1);
          saveToLocalStorage();
        }
        return true;
      }

      throw new Error(response.data?.message || "Failed to delete product");
    } catch (err: any) {
      error.value = err?.message || "Failed to delete product";
      console.error("Error deleting product:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateProduct(product: Product): Promise<Product> {
    
    if (!product || !product.id) {
      error.value = "Invalid product data";
      throw new Error(error.value);
    }

    loading.value = true;

    try {
      const response = await axiosInstance.put(
        `${API_URLS.PRODUCTS.UPDATE}`,
        product
      );

      if (!response || !response.data) {
        throw new Error("No response received from server");
      }

      if (response.data.status === 200 && response.data.data) {
        const serverProduct = response.data.data;
        
        // Fix image URL if needed
        if (serverProduct.slika_url && !serverProduct.slika_url.startsWith('http')) {
          serverProduct.slika_url = `${API_URLS.BASE}${serverProduct.slika_url}`;
        }
        
        // Update the product in our local state
        const index = products.value.findIndex(p => p.id === serverProduct.id);
        if (index !== -1) {
          products.value[index] = serverProduct;
          saveToLocalStorage();
        }
        return serverProduct;
      }

      throw new Error(response.data?.message || "Failed to update product");
    } catch (err: any) {
      error.value = err?.message || "Failed to update product";
      console.error("Error updating product:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Initialize store when created
  initializeStore();

  return {
    // state
    products,
    loading,
    error,
    // getters
    getProducts,
    // setters
    setProducts,
    // actions
    fetchProducts,
    fetchProductById,
    // uploadImage,
    createProduct,
    deleteProduct,
    updateProduct,
    // utility
    initializeStore,
  };
});
