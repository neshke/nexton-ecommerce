import axios from "axios";

const axiosInstance = axios.create({
  // Use baseURL without trailing slash - match API configuration
  baseURL: "http://93.86.80.61:8080",
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
    
    // Log the final URL for debugging
    console.log("Request method:", config.method);
    console.log("Final request URL:", `${config.baseURL}${config.url}`);
    console.log("Auth header:", config.headers.Authorization ? "Present" : "Missing");
    
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle authentication errors
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
