import { defineStore } from "pinia";
import axiosInstance from "@/config/axios";
import { ref } from "vue";
import { API_URLS } from "@/config/api";
import { useActivityTracker } from "@/services/activityTracker";

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface User {
  id: string; // Changed from number to string to match API response
  username: string; // Changed from name to username
  email: string;
}

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Initialize state from localStorage
  const initializeAuth = () => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    if (savedUser) user.value = JSON.parse(savedUser);
    if (savedToken) token.value = savedToken;
  };

  // Login
  const login = async (credentials: LoginData) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axiosInstance.post(
        API_URLS.AUTH.LOGIN,
        credentials
      );

      if (response.data.status === "success") {
        user.value = response.data.user;
        token.value = response.data.token;

        // Save to localStorage
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("token", response.data.token);

        // Start activity tracking immediately after successful login
        const activityTracker = useActivityTracker();
        activityTracker.startTracking();

        return true;
      }
      throw new Error(response.data.message || "Login failed");
    } catch (err: any) {
      error.value =
        err.response?.data?.message || err.message || "Login failed";
      return false;
    } finally {
      loading.value = false;
    }
  };

  // Register
  const register = async (userData: RegisterData) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axiosInstance.post(
        "/auth/register.php",
        {
          username: userData.username,
          email: userData.email,
          password: userData.password,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.status === "success") {
        // Update to match the nested data structure
        user.value = response.data.user;
        token.value = response.data.token;

        // Save to localStorage with correct data structure
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("token", response.data.token);

        // Start activity tracking
        const activityTracker = useActivityTracker();
        activityTracker.startTracking();

        return true;
      }
      throw new Error(response.data.message || "Registration failed");
    } catch (err: any) {
      error.value =
        err.response?.data?.message || err.message || "Registration failed";
      return false;
    } finally {
      loading.value = false;
    }
  };

  // Logout
  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // Check if user is authenticated
  const isAuthenticated = (): boolean => {
    return !!token.value && !!user.value;
  };

  return {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
    initializeAuth,
  };
});
