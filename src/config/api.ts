const BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1/nexton-ecommerce";

export const API_URLS = {
  BASE: BASE_URL,
  PRODUCTS: {
    READ: `${BASE_URL}/api/products/read.php`,
    CREATE: `${BASE_URL}/api/products/create.php`,
    UPLOAD_IMAGE: `${BASE_URL}/api/products/upload.php`,
  },
  AUTH: {
    LOGIN: `${BASE_URL}/api/auth/login.php`,
    REGISTER: `${BASE_URL}/api/auth/register.php`,
  },
  UPLOADS: `${BASE_URL}/uploads/`,
};
