import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios, { AxiosError } from "axios";
import type { Product } from "@/types";
import { API_URLS } from "@/config/api";
import { PLACEHOLDER_IMAGE } from "@/utils/constants";

interface ApiResponse<T> {
  status: "success" | "error";
  message?: string;
  data?: T;
}

function normalizeProduct(product: any): Product {
  return {
    ...product,
    price:
      typeof product.price === "string"
        ? parseFloat(product.price)
        : product.price,
    image_url: product.image_url || PLACEHOLDER_IMAGE,
  };
}

export const useProductStore = defineStore("products", () => {
  // state
  const products = ref<Product[]>([]);
  const cart = ref<Array<Product & { quantity: number }>>([]);
  const loading = ref<{ [key: string]: boolean }>({
    fetch: false,
    create: false,
    upload: false,
  });
  const error = ref<string | null>(null);

  // Modified initialize function to fetch if no stored products
  const initializeStore = async () => {
    const savedProducts = localStorage.getItem('products');
    const savedCart = localStorage.getItem('cart');
    
    if (savedProducts) {
      products.value = JSON.parse(savedProducts);
    } else {
      await fetchProducts(); // Fetch if no stored products
    }
    
    if (savedCart) cart.value = JSON.parse(savedCart);
  };

  // Save state to localStorage
  const saveToLocalStorage = () => {
    localStorage.setItem('products', JSON.stringify(products.value));
    localStorage.setItem('cart', JSON.stringify(cart.value));
  };

  // getters
  const getProducts = computed(() => products.value);
  const getCartItems = computed(() => cart.value);
  const cartTotal = computed(() =>
    cart.value.reduce((total, item) => total + item.price * item.quantity, 0)
  );
  const cartItemCount = computed(() =>
    cart.value.reduce((count, item) => count + item.quantity, 0)
  );

  // actions
  async function fetchProducts(): Promise<void> {
    loading.value.fetch = true;
    error.value = null;

    try {
      const response = await axios.get<ApiResponse<Product[]>>(
        API_URLS.PRODUCTS.READ
      );
      if (!response?.data) {
        throw new Error("No response data received");
      }

      if (
        response.data.status === "success" &&
        Array.isArray(response.data.data)
      ) {
        products.value = response.data.data.map(normalizeProduct);
        saveToLocalStorage(); // Save after successful fetch
        console.log("Products fetched:", products.value);
      } else {
        throw new Error(response.data.message || "Failed to fetch products");
      }
    } catch (err) {
      const axiosError = err as AxiosError<ApiResponse<never>>;
      error.value =
        axiosError?.response?.data?.message ?? "Failed to fetch products";
      console.error(error.value);
    } finally {
      loading.value.fetch = false;
    }
  }

  async function fetchProductById(id: number): Promise<Product | null> {
    loading.value.fetch = true;
    error.value = null;

    try {
      const response = await axios.get<ApiResponse<Product>>(
        `${API_URLS.PRODUCTS.READ}/${id}`
      );
      if (!response?.data) {
        throw new Error("No response data received");
      }

      if (response.data.status === "success" && response.data.data) {
        return normalizeProduct(response.data.data);
      }
      return null;
    } catch (err) {
      const axiosError = err as AxiosError<ApiResponse<never>>;
      error.value =
        axiosError?.response?.data?.message ?? "Failed to fetch product";
      console.error(error.value);
      return null;
    } finally {
      loading.value.fetch = false;
    }
  }

  async function uploadImage(file: File): Promise<string> {
    if (!file) throw new Error("No file provided");
    loading.value.upload = true;

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.post<ApiResponse<{ filename: string }>>(
        API_URLS.PRODUCTS.UPLOAD_IMAGE,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!response?.data) {
        throw new Error("No response data received");
      }

      if (response.data.status === "success" && response.data.data?.filename) {
        return `${API_URLS.UPLOADS}${response.data.data.filename}`;
      }
      throw new Error(response.data.message || "Failed to upload image");
    } catch (err) {
      const axiosError = err as AxiosError<ApiResponse<never>>;
      const errorMessage =
        axiosError.response?.data?.message ?? "Failed to upload image";
      error.value = errorMessage;
      console.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      loading.value.upload = false;
    }
  }

  async function createProduct(product: Omit<Product, "id">): Promise<Product> {
    loading.value.create = true;
    error.value = null;

    try {
      const response = await axios.post<ApiResponse<Product>>(
        API_URLS.PRODUCTS.CREATE,
        product
      );

      if (!response?.data) {
        throw new Error("No response data received");
      }

      if (response.data.status === "success" && response.data.data) {
        products.value.push(response.data.data);
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to create product");
    } catch (err) {
      const axiosError = err as AxiosError<ApiResponse<never>>;
      const errorMessage =
        axiosError.response?.data?.message ?? "Failed to create product";
      error.value = errorMessage;
      console.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      loading.value.create = false;
    }
  }

  function addToCart({
    product,
    quantity = 1,
  }: {
    product: Product;
    quantity: number;
  }) {
    const existingItem = cart.value.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.value.push({
        ...product,
        quantity,
      });
    }
    saveToLocalStorage();
  }

  function removeFromCart(productId: number) {
    const index = cart.value.findIndex((item) => item.id === productId);
    if (index > -1) {
      cart.value.splice(index, 1);
      saveToLocalStorage();
    }
  }

  function updateCartQuantity(productId: number, quantity: number) {
    const item = cart.value.find((item) => item.id === productId);
    if (item && quantity > 0) {
      item.quantity = quantity;
      saveToLocalStorage();
    }
  }

  function clearCart() {
    cart.value = [];
    saveToLocalStorage();
  }

  // Initialize store when created
  initializeStore();

  return {
    // state
    products,
    cart,
    loading,
    error,
    // getters
    getProducts,
    getCartItems,
    cartTotal,
    cartItemCount,
    // actions
    fetchProducts,
    fetchProductById,
    uploadImage,
    createProduct,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    initializeStore,
  };
});
