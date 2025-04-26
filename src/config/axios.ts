import axios from "axios";

const axiosInstance = axios.create({
  // Use baseURL without trailing slash
  baseURL: "http://192.168.1.2:8080",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Add request interceptor to fix URL issues
axiosInstance.interceptors.request.use(
  (config) => {
    // Log the final URL for debugging
    console.log("Request method:", config.method);
    console.log("Final request URL:", `${config.baseURL}${config.url}`);
    
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
