import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { API_URLS } from "@/config/api";
import { useActivityTracker } from "@/services/activityTracker";
import axiosInstance from "@/config/axios";
import { useCartStore } from "@/stores/cartStore";
import type { 
  LoginData, 
  RegisterData, 
  User, 
  TokenData, 
  AuthResponse 
} from "@/models/auth";

/**
 * Pinia store za upravljanje stanjem autentifikacije korisnika.
 * Uključuje metode za prijavu, registraciju, odjavu, proveru statusa autentifikacije i inicijalizaciju stanja.
 */
export const useAuthStore = defineStore("auth", () => {
  // Stanje (State)
  const user = ref<User | null>(null); // Podaci o trenutno prijavljenom korisniku
  const tokenValue = ref<string | null>(null); // Vrednost JWT tokena
  const tokenExpiresAt = ref<number | null>(null); // Timestamp isteka tokena (u sekundama)
  const loading = ref(false); // Indikator da li je u toku operacija autentifikacije
  const error = ref<string | null>(null); // Poruka o grešci prilikom autentifikacije

  /**
   * Inicijalizuje stanje autentifikacije na osnovu podataka sačuvanih u localStorage.
   * Proverava da li postoji sačuvan korisnik i token, i da li je token istekao.
   */
  const initializeAuth = () => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    
    if (savedUser) {
      user.value = JSON.parse(savedUser);
    }
    
    if (savedToken) {
      const tokenData: TokenData = JSON.parse(savedToken);
      
      // Provera da li je token istekao
      if (tokenData.expiresAt && Date.now() / 1000 >= tokenData.expiresAt) {
        // Token je istekao, brišemo podatke iz localStorage
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        return;
      }
      
      tokenValue.value = tokenData.value;
      tokenExpiresAt.value = tokenData.expiresAt;
    }
  };

  /**
   * Prijavljuje korisnika sa prosleđenim kredencijalima.
   * @param credentials - Objekat sa email-om i lozinkom korisnika.
   * @returns Promise koji razrešava AuthResponse objekat (uspeh/greška).
   */
  async function login(credentials: LoginData): Promise<AuthResponse> {
    loading.value = true;
    error.value = null;
    try {
      const response = await axiosInstance.post(
        API_URLS.AUTH.LOGIN,
        credentials
      );
      if (response.data.status === 200) {
        user.value = response.data.data.user;
        
        const tokenData: TokenData = response.data.data.token;
        tokenValue.value = tokenData.value;
        tokenExpiresAt.value = tokenData.expiresAt;

        localStorage.setItem("user", JSON.stringify(user.value));
        localStorage.setItem("token", JSON.stringify(tokenData));

        const activityTracker = useActivityTracker();
        activityTracker.startTracking(); // Pokretanje praćenja neaktivnosti nakon prijave
        return { success: true, error: null };
      }
      throw new Error(response.data.message);
    } catch (err: any) {
      error.value = err.response?.data?.message || "Greška pri prijavi";
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  /**
   * Registruje novog korisnika.
   * @param userData - Podaci potrebni za registraciju novog korisnika.
   * @returns Promise koji razrešava AuthResponse objekat (uspeh/greška).
   */
  async function register(userData: RegisterData): Promise<AuthResponse> {
    loading.value = true;
    error.value = null;
    try {
      const response = await axiosInstance.post(
        API_URLS.AUTH.REGISTER,
        userData
      );
      if (response.data.status === 201) {
        user.value = response.data.data.user;
        
        let tokenData: TokenData;
        if (typeof response.data.data.token === 'object' && response.data.data.token.value) {
          tokenData = response.data.data.token;
        } else {
          // Fallback za kompatibilnost sa starijim odgovorima servera
          tokenData = {
            value: response.data.data.token,
            expiresAt: Math.floor(Date.now() / 1000) + (15 * 60) // Podrazumevano vreme isteka od 15 minuta
          };
        }
        
        tokenValue.value = tokenData.value;
        tokenExpiresAt.value = tokenData.expiresAt;

        localStorage.setItem("user", JSON.stringify(user.value));
        localStorage.setItem("token", JSON.stringify(tokenData));

        const activityTracker = useActivityTracker();
        activityTracker.startTracking(); // Pokretanje praćenja neaktivnosti nakon registracije
        return { success: true, error: null };
      }
      throw new Error(response.data.message);
    } catch (err: any) {
      error.value = err.response?.data?.message || "Greška pri registraciji";
      return { success: false, error: error.value };
    } finally {
      loading.value = false;
    }
  }

  /**
   * Odjavljuje trenutno prijavljenog korisnika.
   * Briše podatke o korisniku i token iz stanja i localStorage-a.
   * Zaustavlja praćenje neaktivnosti i čisti korpu.
   * @returns Promise koji razrešava AuthResponse objekat (uspeh/greška).
   */
  async function logout(): Promise<AuthResponse> {
    try {
      const cartStore = useCartStore();
      cartStore.clearCart(); // Čišćenje korpe prilikom odjave

      user.value = null;
      tokenValue.value = null;
      tokenExpiresAt.value = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      const activityTracker = useActivityTracker();
      activityTracker.stopTracking(); // Zaustavljanje praćenja neaktivnosti

      return { success: true, error: null };
    } catch (err: any) {
      error.value = "Greška pri odjavljivanju";
      return { success: false, error: error.value };
    }
  }

  /**
   * Proverava da li je korisnik autentifikovan i da li je token validan (nije istekao).
   * Automatski odjavljuje korisnika ako je token istekao.
   * @returns boolean - True ako je korisnik autentifikovan, inače false.
   */
  const isAuthenticated = computed(() => {
    if (!tokenValue.value) {
      return false;
    }
    
    if (tokenExpiresAt.value && (Date.now() / 1000 >= tokenExpiresAt.value)) {
      logout(); // Token je istekao, odjavi korisnika
      return false;
    }
    
    return !!user.value;
  });

  /**
   * Proverava da li trenutno prijavljeni korisnik ima administratorsku ulogu.
   * @returns boolean - True ako je korisnik admin, inače false.
   */
  const isAdmin = computed(() => {
    if (!user.value) return false;
    return user.value.role === 'admin';
  });

  /**
   * Vraća trenutni JWT token.
   * @returns string | null - Vrednost tokena ili null ako ne postoji.
   */
  const getToken = (): string | null => {
    return tokenValue.value;
  };

  // Izloženo stanje i metode
  return {
    user,
    getToken,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
    isAdmin,
    initializeAuth,
    tokenValue, // Izlažemo i tokenValue i tokenExpiresAt ako su potrebni van stora
    tokenExpiresAt
  };
});
