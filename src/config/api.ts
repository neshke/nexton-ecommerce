// API URLs
const BASE_URL = "http://93.86.80.61:8080";

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
    CREATE: `${BASE_URL}/nexton/api/orders/create_order.php`,
    GET_USER_ORDERS: `${BASE_URL}/nexton/api/orders/get_user_orders.php`,
    GET_ALL_ORDERS_ADMIN: `${BASE_URL}/nexton/api/orders/get_all_orders_admin.php`
  }, PROFILE: {
    GET: `${BASE_URL}/nexton/api/profile/index.php`,
    UPDATE: `${BASE_URL}/nexton/api/profile/index.php`,
    CHANGE_PASSWORD: `${BASE_URL}/nexton/api/profile/change-password.php`,
  }, CONTACT: {
    SEND_MESSAGE: `${BASE_URL}/nexton/api/contact/send_message.php`,
  }
};
