import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Category } from "@/models";
import { API_URLS } from "@/config/api";
import axiosInstance from "@/config/axios";

/**
 * Pinia store za upravljanje kategorijama proizvoda.
 * Omogućava dohvatanje kategorija sa servera, čuvanje u stanju i localStorage-u,
 * kao i dobijanje kategorija ili njihovih naziva po ID-u.
 */
export const useCategoryStore = defineStore("categories", () => {
  // ---------- STATE ----------
  const categories = ref<Category[]>([]); // Niz svih kategorija
  const loading = ref(false); // Indikator da li je u toku dohvatanje kategorija
  const error = ref<string | null>(null); // Poruka o grešci prilikom dohvatanja kategorija

  /**
   * Čuva trenutno stanje kategorija u localStorage.
   */
  const saveToLocalStorage = () => {
    localStorage.setItem("categories", JSON.stringify(categories.value));
  };

  /**
   * Inicijalizuje stanje kategorija.
   * Pokušava da učita kategorije iz localStorage-a; ako nisu dostupne, dohvata ih sa servera.
   */
  const initializeStore = async () => {
    const savedCategories = localStorage.getItem("categories");

    if (savedCategories) {
      try {
        const parsedCategories = JSON.parse(savedCategories);
        if (Array.isArray(parsedCategories)) {
          categories.value = parsedCategories;
        } else {
          console.warn("Sačuvane kategorije nisu niz, pokreće se dohvatanje sa servera.");
          await fetchCategories();
        }
      } catch (e) {
        console.error("Greška pri parsiranju sačuvanih kategorija, pokreće se dohvatanje sa servera.", e);
        await fetchCategories();
      }
    } else {
      await fetchCategories();
    }
  };

  // ---------- GETTERS (Computed properties) ----------
  /**
   * Vraća sve kategorije.
   * @returns ComputedRef<Category[]> - Niz kategorija.
   */
  const getCategories = computed(() => categories.value);
  
  /**
   * Vraća kategoriju na osnovu njenog ID-a.
   * @param id - ID kategorije.
   * @returns ComputedRef<(id: number) => Category | null> - Funkcija koja vraća kategoriju ili null.
   */
  const getCategoryById = computed(() => (id: number) => {
    return categories.value.find(category => category.id === id) || null;
  });
  
  /**
   * Vraća naziv kategorije na osnovu njenog ID-a.
   * @param id - ID kategorije.
   * @returns ComputedRef<(id: number) => string> - Funkcija koja vraća naziv kategorije ili 'Uncategorized'.
   */
  const getCategoryNameById = computed(() => (id: number) => {
    const category = categories.value.find(category => category.id === id);
    return category ? category.naziv : 'Uncategorized'; // Podrazumevani naziv ako kategorija nije pronađena
  });

  // ---------- ACTIONS ----------
  /**
   * Dohvata sve kategorije proizvoda sa servera.
   * Ažurira stanje kategorija, loading i error status.
   * Čuva dohvaćene kategorije u localStorage.
   */
  async function fetchCategories(): Promise<void> {
    // Ako su kategorije već učitane i nije bilo greške pri prethodnom pokušaju, ne radi ništa.
    // Ovo omogućava ponovni pokušaj ako je prethodni bio neuspešan (error.value bi bio postavljen).
    if (categories.value.length > 0 && !error.value) {
      return;
    }

    // Ako je dohvatanje već u toku, ne započinji novo.
    if (loading.value) {
      return;
    }

    loading.value = true;
    // Resetuj grešku pre novog pokušaja. Ako ovaj pokušaj ne uspe, error.value će biti postavljen.
    // Ako uspe, error.value ostaje null, što će gornji uslov (categories.value.length > 0 && !error.value)
    // koristiti da spreči nepotrebno dohvatanje u budućim pozivima.
    error.value = null;

    try {
      const response = await axiosInstance.get(API_URLS.CATEGORIES.READ);

      if (!response || !response.data) {
        throw new Error("Nije primljen odgovor od servera prilikom dohvatanja kategorija.");
      }

      if (response.data.status === 200 && Array.isArray(response.data.data)) {
        categories.value = response.data.data;
        saveToLocalStorage();
        // error.value ostaje null nakon uspešnog dohvatanja
      } else {
        throw new Error(response.data?.message || "Neuspešno dohvatanje kategorija.");
      }
    } catch (err: any) {
      error.value = err?.message || "Došlo je do greške prilikom dohvatanja kategorija.";
      console.error("Greška pri dohvatanju kategorija:", err); // Originalna linija 101 za grešku
      // Ne čistimo categories.value ovde nužno; error.value će osigurati da sledeći poziv pokuša ponovo.
      // Ako bismo očistili categories.value, to bi moglo izazvati treperenje UI ako su postojali stari podaci.
    } finally {
      loading.value = false;
    }
  }

  // Inicijalizacija stora prilikom njegovog kreiranja
  initializeStore();

  return {
    // State
    categories,
    loading,
    error,
    // Getters
    getCategories,
    getCategoryById,
    getCategoryNameById,
    // Actions
    fetchCategories,
    // Utility (exposed for potential manual re-initialization if needed)
    initializeStore,
  };
});