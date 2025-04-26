// API URLs
const BASE_URL = "http://192.168.1.2:8080";

export const API_URLS = {
  BASE: BASE_URL,
  UPLOADS: `${BASE_URL}/nexton/api/uploads/`,
  AUTH: {
    LOGIN: `${BASE_URL}/nexton/api/auth/login.php`,
    REGISTER: `${BASE_URL}/nexton/api/auth/register.php`,
    VALIDATE: `${BASE_URL}/nexton/api/auth/validate.php`,
  },
  PRODUCTS: {
    READ: `${BASE_URL}/nexton/api/products/index.php`,
    CREATE: `${BASE_URL}/nexton/api/products/index.php`,
    UPDATE: `${BASE_URL}/nexton/api/products/index.php`,
    DELETE: `${BASE_URL}/nexton/api/products/index.php`,
  },
  CATEGORIES: {
    READ: `${BASE_URL}/nexton/api/categories/index.php`,
    CREATE: `${BASE_URL}/nexton/api/categories/index.php`,
    UPDATE: `${BASE_URL}/nexton/api/categories/index.php`,
    DELETE: `${BASE_URL}/nexton/api/categories/index.php`,
  },
  ORDERS: {
    CREATE: `${BASE_URL}/nexton/api/orders/index.php`,
    READ: `${BASE_URL}/nexton/api/orders/index.php`,
  },
};
