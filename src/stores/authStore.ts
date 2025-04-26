import { defineStore } from "pinia";
import { ref, computed } from "vue"; // Add computed import
import { API_URLS } from "@/config/api";
import { useActivityTracker } from "@/services/activityTracker";
import axiosInstance from "@/config/axios";
import { useCartStore } from "@/stores/cartStore"; // Import the cart store
import type { 
  LoginData, 
  RegisterData, 
  User, 
  TokenData, 
  AuthResponse 
} from "@/models/auth";

/**
 * Auth store for managing user authentication state
 */
export const useAuthStore = defineStore("auth", () => {
  // State
  const user = ref<User | null>(null);
  const tokenValue = ref<string | null>(null);
  const tokenExpiresAt = ref<number | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Initialize authentication state from localStorage
   */
  const initializeAuth = () => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    
    if (savedUser) {
      user.value = JSON.parse(savedUser);
    }
    
    if (savedToken) {
      const tokenData: TokenData = JSON.parse(savedToken);
      
      // Check if token has expired
      if (tokenData.expiresAt && Date.now() / 1000 >= tokenData.expiresAt) {
        // Token has expired, clear localStorage
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        return;
      }
      
      tokenValue.value = tokenData.value;
      tokenExpiresAt.value = tokenData.expiresAt;
    }
  };

  /**
   * Login user with credentials
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
        
        // Extract token data from the response
        const tokenData: TokenData = response.data.data.token;
        tokenValue.value = tokenData.value;
        tokenExpiresAt.value = tokenData.expiresAt;

        // Store user and token in localStorage
        localStorage.setItem("user", JSON.stringify(user.value));
        localStorage.setItem("token", JSON.stringify(tokenData));

        const activityTracker = useActivityTracker();
        activityTracker.startTracking();
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
   * Register a new user
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
        
        // Extract token data
        let tokenData: TokenData;
        
        if (typeof response.data.data.token === 'object' && response.data.data.token.value) {
          tokenData = response.data.data.token;
        } else {
          // Fallback for backward compatibility
          tokenData = {
            value: response.data.data.token,
            expiresAt: Math.floor(Date.now() / 1000) + (15 * 60) // Default 15 min expiry
          };
        }
        
        tokenValue.value = tokenData.value;
        tokenExpiresAt.value = tokenData.expiresAt;

        // Store as a single object
        localStorage.setItem("user", JSON.stringify(user.value));
        localStorage.setItem("token", JSON.stringify(tokenData));

        const activityTracker = useActivityTracker();
        activityTracker.startTracking();
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
   * Log out the current user
   */
  async function logout(): Promise<AuthResponse> {
    try {
      const cartStore = useCartStore(); // Get cart store instance
      cartStore.clearCart(); // Clear the cart

      user.value = null;
      tokenValue.value = null;
      tokenExpiresAt.value = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      const activityTracker = useActivityTracker();
      activityTracker.stopTracking();

      return { success: true, error: null };
    } catch (err: any) {
      error.value = "Greška pri odjavljivanju";
      return { success: false, error: error.value };
    }
  }

  /**
   * Check if user is authenticated with a valid token
   */
  const isAuthenticated = computed(() => {
    // First check if token exists and is not expired
    if (!tokenValue.value) {
      return false;
    }
    
    // Check if token has expired
    if (tokenExpiresAt.value && (Date.now() / 1000 >= tokenExpiresAt.value)) {
      // Token has expired - clear authentication
      logout();
      return false;
    }
    
    // Check if user object exists
    return !!user.value;
  });

  /**
   * Check if current user has admin role
   */
  const isAdmin = computed(() => {
    if (!user.value) return false;
    return user.value.role === 'admin';
  });

  /**
   * Get token for API requests
   */
  const getToken = (): string | null => {
    return tokenValue.value;
  };

  // Exposed state and methods
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
  };
});
