import axios from "axios";

const axiosInstance = axios.create({
  // Use baseURL without trailing slash - match API configuration
  baseURL: "http://localhost:80",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Add request interceptor to add auth token and fix URL issues
axiosInstance.interceptors.request.use(
  (config) => {
    // Add authentication token if available
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const tokenData = JSON.parse(token);
        if (tokenData.value) {
          config.headers.Authorization = `Bearer ${tokenData.value}`;
        }
      } catch (error) {
        console.error("Error parsing token:", error);
      }
    }


    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 errors (token expired/invalid)
    if (error.response?.status === 401) {
      // Clear localStorage and redirect to login
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
