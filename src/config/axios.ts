import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1/nexton-ecommerce/api', // Update this to match your API URL
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false // Change to false since we're not using credentials
});

export default axiosInstance;
