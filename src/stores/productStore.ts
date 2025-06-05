import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Product } from "@/models";

import { API_URLS } from "@/config/api";
import axiosInstance from "@/config/axios";

// Osnovni URL za API.
const BASE_URL = typeof API_URLS === 'object' && API_URLS?.BASE
  ? API_URLS.BASE
  : 'http://localhost:8080';

/** Pinia store za upravljanje proizvodima. */
export const useProductStore = defineStore("products", () => {
  const products = ref<Product[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /** Formira apsolutnu URL adresu slike. */
  const formatImageUrl = (url: string | undefined): string => {
    if (!url) return ''; // Rukovanje undefined ili praznim stringom

    if (url.startsWith('http')) return url;

    if (url.startsWith(`${BASE_URL}/nexton/api/uploads/`)) return url;

    if (url.startsWith('/nexton/api/uploads')) {
      return `${BASE_URL}${url}`;
    }

    return `${BASE_URL}/nexton/api/uploads/${url}`;
  };

  /** Čuva trenutno stanje proizvoda u localStorage. */
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem("products", JSON.stringify(products.value));
    } catch (e) {
      console.error("Neuspešno čuvanje proizvoda u localStorage:", e);
    }
  };

  /** Inicijalizuje store učitavanjem proizvoda iz localStorage ili sa API-ja. */
  const initializeStore = async () => {
    try {
      const savedProducts = localStorage.getItem("products");
      if (savedProducts) {
        const parsedProducts: Product[] = JSON.parse(savedProducts);
        if (Array.isArray(parsedProducts) && parsedProducts.every(p => typeof p === 'object' && p !== null && 'id' in p)) {
          products.value = parsedProducts.map(product => ({
            ...product,
            slika_url: formatImageUrl(product.slika_url) 
          }));
        } else {
          console.warn("Pronađeni nevalidni podaci o proizvodima u localStorage. Preuzimanje sa API-ja.");
          await fetchProducts();
        }
      } else {
        await fetchProducts();
      }
    } catch (e) {
      console.error("Neuspešna inicijalizacija product store-a iz localStorage:", e);
      await fetchProducts();
    }
  };

  // Računato svojstvo za dobijanje svih proizvoda.
  const getProducts = computed(() => products.value);

  /** Postavlja listu proizvoda i čuva je u localStorage. */
  const setProducts = (productList: Product[]) => {
    if (Array.isArray(productList)) {
      products.value = productList.map(product => ({
        ...product,
        slika_url: formatImageUrl(product.slika_url)
      }));
      saveToLocalStorage();
    } else {
      console.error("setProducts je primio nevalidnu listu proizvoda:", productList);
    }
  };

  /** Preuzima sve proizvode sa API-ja. */
  async function fetchProducts(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const response = await axiosInstance.get(API_URLS.PRODUCTS.READ);
      if (!response || !response.data) {
        throw new Error("Nije primljen odgovor od servera");
      }

      if (response.data.status === 200 && Array.isArray(response.data.data)) {
        const processedProducts = response.data.data.map((item: any) => ({
          ...item,
          slika_url: formatImageUrl(item.slika_url)
        })); 
        setProducts(processedProducts);
      } else {
        throw new Error(response.data?.message || "Neuspešno preuzimanje proizvoda");
      }
    } catch (err: any) {
      error.value = err?.message || "Neuspešno preuzimanje proizvoda";
      console.error("Greška prilikom preuzimanja proizvoda:", err);
    } finally {
      loading.value = false;
    }
  }

  /** Preuzima jedan proizvod po ID-ju sa API-ja. */
  async function fetchProductById(id: number): Promise<Product | null> {
    if (!id || typeof id !== 'number') {
      error.value = "Dostavljen je nevalidan ID proizvoda.";
      console.error(error.value, "ID:", id);
      return null;
    }

    loading.value = true;
    error.value = null;
    try {
      const existingProduct = products.value.find(p => p.id === id);
      if (existingProduct) {
        existingProduct.slika_url = formatImageUrl(existingProduct.slika_url);
        return existingProduct;
      }

      const response = await axiosInstance.get(
        `${API_URLS.PRODUCTS.READ}?id=${id}`
      );
      if (!response || !response.data) {
        throw new Error("Nije primljen odgovor od servera");
      }

      if (response.data.status === 200 && response.data.data) {
        const productData = response.data.data as Product;
        productData.slika_url = formatImageUrl(productData.slika_url);
        const index = products.value.findIndex(p => p.id === productData.id);
        if (index !== -1) {
          products.value[index] = productData;
        } else {
          products.value.push(productData);
        }
        saveToLocalStorage();
        return productData;
      } else if (response.data.status === 404) {
        error.value = `Proizvod sa ID ${id} nije pronađen.`;
        return null;
      }
      throw new Error(response.data?.message || `Neuspešno preuzimanje proizvoda sa ID ${id}`);
    } catch (err: any) {
      error.value = err?.message || `Neuspešno preuzimanje proizvoda ${id}`;
      console.error(`Greška prilikom preuzimanja proizvoda ${id}:`, err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  /** Otprema datoteku slike na server. */
  async function uploadImage(file: File, imageName?: string): Promise<string> {
    if (!file) {
      const errMsg = "Nije dostavljena datoteka za otpremanje.";
      error.value = errMsg;
      throw new Error(errMsg);
    }

    loading.value = true;
    error.value = null;
    try {
      const formData = new FormData();
      formData.append("image", file);
      if (imageName && imageName.trim()) {
        formData.append("imageName", imageName.trim());
      }

      const response = await axiosInstance.post(
        "http://localhost:8080/nexton/api/image-upload/upload.php", // Vraćeno na originalni hardkodirani URL
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (!response || !response.data) {
        throw new Error("Nije primljen odgovor od servera tokom otpremanja slike");
      }

      if (response.data.status === 201 && response.data.data?.url) {
        return formatImageUrl(response.data.data.url);
      }
      throw new Error(response.data?.message || "Neuspešno otpremanje slike");
    } catch (err: any) {
      error.value = err?.message || "Neuspešno otpremanje slike";
      console.error("Greška prilikom otpremanja slike:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /** Kreira novi proizvod na serveru. */
  async function createProduct(productData: Omit<Product, "id">): Promise<Product> {
    if (!productData) {
      const errMsg = "Nisu dostavljeni podaci o proizvodu za kreiranje.";
      error.value = errMsg;
      throw new Error(errMsg);
    }

    loading.value = true;
    error.value = null;
    try {
      const response = await axiosInstance.post(
        API_URLS.PRODUCTS.CREATE,
        productData
      );
      if (!response || !response.data) {
        throw new Error("Nije primljen odgovor od servera tokom kreiranja proizvoda");
      }

      if (response.data.status === 201 && response.data.data) {
        const serverProduct = response.data.data as Product;
        serverProduct.slika_url = formatImageUrl(serverProduct.slika_url);
        products.value.push(serverProduct);
        saveToLocalStorage();
        return serverProduct;
      }
      throw new Error(response.data?.message || "Neuspešno kreiranje proizvoda");
    } catch (err: any) {
      error.value = err?.message || "Neuspešno kreiranje proizvoda";
      console.error("Greška prilikom kreiranja proizvoda:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /** Briše proizvod sa servera po njegovom ID-ju. */
  async function deleteProduct(id: number): Promise<boolean> {
    if (!id || typeof id !== 'number') {
      const errMsg = "Dostavljen je nevalidan ID proizvoda za brisanje.";
      error.value = errMsg;
      throw new Error(errMsg);
    }

    loading.value = true;
    error.value = null;
    try {
      const { useAuthStore } = await import('@/stores/authStore');
      const authStore = useAuthStore();
      const token = authStore.getToken();

      if (!token) {
        throw new Error("Autentifikacija je neophodna za brisanje proizvoda.");
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
        throw new Error("Nije primljen odgovor od servera tokom brisanja proizvoda");
      }

      if (response.data.status === 200) {
        const index = products.value.findIndex(p => p.id === id);
        if (index !== -1) {
          products.value.splice(index, 1);
          saveToLocalStorage();
        }
        return true;
      }
      throw new Error(response.data?.message || `Neuspešno brisanje proizvoda sa ID ${id}`);
    } catch (err: any) {
      error.value = err?.message || `Neuspešno brisanje proizvoda sa ID ${id}`;
      console.error(`Greška prilikom brisanja proizvoda ${id}:`, err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /** Ažurira postojeći proizvod na serveru. */
  async function updateProduct(productData: Product): Promise<Product> {
    if (!productData || !productData.id) {
      const errMsg = "Dostavljeni su nevalidni podaci o proizvodu za ažuriranje.";
      error.value = errMsg;
      throw new Error(errMsg);
    }

    loading.value = true;
    error.value = null;
    try {
      // Ensure the product ID is part of the URL for the PUT request
      const url = `${API_URLS.PRODUCTS.UPDATE}?id=${productData.id}`;
      const response = await axiosInstance.put(
        url, 
        productData
      );

      if (!response || !response.data) {
        throw new Error("Nije primljen odgovor od servera tokom ažuriranja proizvoda");
      }

      console.log("Response data:", response.data);
      if (response.data.status === 200) {
        // Uspešno ažuriranje, backend vraća poruku o uspehu, ne ceo objekat
        // Koristimo productData koji je poslat jer je to sada stanje na serveru
        const productToUpdateInStore = { ...productData };
        productToUpdateInStore.slika_url = formatImageUrl(productToUpdateInStore.slika_url);

        const index = products.value.findIndex(p => p.id === productToUpdateInStore.id);
        if (index !== -1) {
          products.value[index] = productToUpdateInStore;
        } else {
          // Ako proizvod nije pronađen lokalno, dodajemo ga.
          // Ovo može da se desi ako lokalni store nije sinhronizovan.
          products.value.push(productToUpdateInStore);
        }
        saveToLocalStorage();
        return productToUpdateInStore; // Vraćamo podatke koji su uspešno ažurirani
      } else {
        // Ako status nije 200, tretiramo kao grešku
        throw new Error(response.data?.message || `Neuspešno ažuriranje proizvoda sa ID ${productData.id}`);
      }
    } catch (err: any) {
      error.value = err?.message || `Neuspešno ažuriranje proizvoda sa ID ${productData.id}`;
      console.error(`Greška prilikom ažuriranja proizvoda ${productData.id}:`, err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /** Preuzima proizvode po kategoriji. */
  const fetchProductsByCategory = async (categoryId: number) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axiosInstance.get(
        `${API_URLS.PRODUCTS.READ}?categoryId=${categoryId}`
      );
      if (!response || !response.data) {
        throw new Error("Nije primljen odgovor od servera");
      }

      if (response.data.status === 200 && Array.isArray(response.data.data)) {
        const processedProducts = response.data.data.map((item: any) => ({
          ...item,
          slika_url: formatImageUrl(item.slika_url)
        })); 
        setProducts(processedProducts);
      } else {
        throw new Error(response.data?.message || "Neuspešno preuzimanje proizvoda po kategoriji");
      }
    } catch (err: any) {
      error.value = err?.message || "Neuspešno preuzimanje proizvoda po kategoriji";
      console.error("Greška prilikom preuzimanja proizvoda po kategoriji:", err);
    } finally {
      loading.value = false;
    }
  };

  // Inicijalizacija store-a prilikom njegovog kreiranja
  initializeStore();

  return {
    // Stanje
    products,
    loading,
    error,
    // Geteri
    getProducts,
    // Seteri
    setProducts,
    // Akcije
    fetchProducts,
    fetchProductById,
    uploadImage,
    createProduct,
    deleteProduct,
    updateProduct,
    fetchProductsByCategory,
    // Uslužne funkcije (izložene za potencijalnu eksternu upotrebu ili testiranje)
    initializeStore, // Izlažemo za mogućnost reinicijalizacije spolja
    formatImageUrl // Izlažemo ako je potrebno formatiranje URL-ova van store-a
  };
});
