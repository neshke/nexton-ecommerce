import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAuthStore } from './authStore';
import type { User } from '@/models/auth';
import type { Order, OrdersApiResponse, ApiErrorResponse, CreateOrderPayload, CreateOrderApiResponse } from '@/models/order'; // Ispravljeni import-i za CreateOrderPayload i CreateOrderApiResponse
import axiosInstance from '@/config/axios';
import { API_URLS } from '@/config/api';
import axios from 'axios'; // Importovan ceo axios za isAxiosError

/** Pinia store za upravljanje porudžbinama. */
export const useOrdersStore = defineStore('orders', () => {
  // Stanje
  const orders = ref<Order[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // Akcije
  /** Preuzima porudžbine trenutno prijavljenog korisnika. */
  async function fetchUserOrders(): Promise<void> {
    const authStore = useAuthStore();
    const currentUser = authStore.user as User | null;

    if (!currentUser || !currentUser.id) {
      error.value = 'Korisnik nije prijavljen ili ID korisnika nije dostupan.';
      loading.value = false;
      console.error('fetchUserOrders: Korisnički ID nije pronađen u authStore.');
      orders.value = [];
      return;
    }

    loading.value = true;
    error.value = null; try {
      const response = await axiosInstance.get<OrdersApiResponse>(
        `${API_URLS.ORDERS.GET_USER_ORDERS}?user_id=${currentUser.id}`
      );

      // Check if response is successful
      if (response.status === 200 && response.data) {        // If we have data array (orders exist)
        if (response.data.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
          orders.value = response.data.data;
        } else {
          // No orders - this is normal, not an error (only set error if success is explicitly false)
          orders.value = [];
          if (response.data.success === false) {
            error.value = response.data.message || 'Greška pri učitavanju porudžbina.';
          } else {
            error.value = null; // Clear any previous error since having no orders is normal
          }
        }
      } else {
        orders.value = [];
        error.value = `Neočekivani HTTP status: ${response.status}`;
      }
    } catch (err: any) {
      console.error('Greška pri dohvatanju porudžbina:', err);
      // Ispravljena provera za AxiosError
      if (axios.isAxiosError(err) && err.response) {
        const apiError = err.response.data as ApiErrorResponse;
        error.value = apiError.message || 'Nije moguće učitati porudžbine. Molimo pokušajte kasnije.';
      } else {
        error.value = err.message || 'Nije moguće učitati porudžbine. Molimo pokušajte kasnije.';
      }
      orders.value = [];
    } finally {
      loading.value = false;
    }
  }

  /** Preuzima sve porudžbine (samo za administratore). */
  async function fetchAllOrdersAdmin(): Promise<void> {
    const authStore = useAuthStore();
    // Provera da li je korisnik admin. Pretpostavka je da authStore.isAdmin postoji i radi.
    if (!authStore.isAdmin) {
      error.value = 'Pristup odbijen. Samo administratori mogu videti sve porudžbine.';
      loading.value = false;
      orders.value = []; // Isprazni listu ako korisnik nije admin
      console.warn('fetchAllOrdersAdmin: Korisnik nije administrator.');
      return;
    }

    loading.value = true;
    error.value = null;
    try {
      const response = await axiosInstance.get<OrdersApiResponse>(
        API_URLS.ORDERS.GET_ALL_ORDERS_ADMIN
      );
      if (response.data && (response.data.status === 200 || response.status === 200) && response.data.data) {
        orders.value = response.data.data;
      } else if (response.status === 200 && response.data && response.data.message && response.data.message.includes('Nema pronađenih porudžbina')) {
        orders.value = [];
      } else {
        orders.value = [];
        const errorMessage = response.data?.message || `Neočekivani odgovor ili greška sa API-ja. HTTP Status: ${response.status}`;
        console.warn('Neočekivana struktura podataka ili greška iz API-ja za sve porudžbine:', response.data);
        // Bacanje greške da bi se uhvatila u catch bloku
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      console.error('Greška pri dohvatanju svih porudžbina (admin):', err);
      // Ispravljena provera za AxiosError
      if (axios.isAxiosError(err) && err.response) {
        const apiError = err.response.data as ApiErrorResponse;
        error.value = apiError.message || 'Nije moguće učitati sve porudžbine (admin).';
      } else {
        error.value = err.message || 'Nije moguće učitati sve porudžbine (admin).';
      }
      orders.value = [];
    } finally {
      loading.value = false;
    }
  }

  /** Kreira novu porudžbinu. */
  async function createOrder(orderDetails: CreateOrderPayload): Promise<CreateOrderApiResponse> {
    loading.value = true;
    error.value = null;
    try {
      const response = await axiosInstance.post<CreateOrderApiResponse>(
        API_URLS.ORDERS.CREATE,
        orderDetails
      );

      // Provera da li je API vratio uspešan status i podatke
      // Prilagodi response.data.status prema onome što tvoj API zaista vraća
      if (response.data && (response.data.status === 201 || response.data.status === 200 || response.data.success)) {
        return {
          success: true,
          message: response.data.message || 'Porudžbina je uspešno kreirana.',
          order_id: response.data.order_id,
          status: response.data.status // Dodaj status iz odgovora
        };
      } else {
        // Ako API vrati neuspešan status ili nema očekivane podatke
        throw new Error(response.data.message || 'Nepoznata greška prilikom kreiranja porudžbine od strane API-ja.');
      }
    } catch (err: any) {
      console.error('Greška pri kreiranju porudžbine u store-u:', err);
      let errorMessage = 'Nije moguće kreirati porudžbinu. Molimo pokušajte kasnije.';
      let responseStatus: number | undefined = undefined;

      if (axios.isAxiosError(err) && err.response && err.response.data) {
        const apiError = err.response.data as ApiErrorResponse; // Koristi ApiErrorResponse za tipovanje
        errorMessage = apiError.message || errorMessage;
        responseStatus = err.response.status; // Sačuvaj HTTP status greške
      } else if (err.message) {
        errorMessage = err.message;
      }
      error.value = errorMessage;
      return {
        success: false,
        message: errorMessage,
        status: responseStatus || err.response?.data?.status, // Vrati HTTP status ili status iz tela greške
        order_id: undefined // Nema order_id u slučaju greške
      };
    } finally {
      loading.value = false;
    }
  }

  /** Ažurira status porudžbine (samo za administratore). */
  async function updateOrderStatusAdmin(orderId: number, newStatus: string): Promise<boolean> {
    const authStore = useAuthStore();
    if (!authStore.isAdmin) {
      error.value = 'Pristup odbijen. Samo administratori mogu menjati status porudžbine.';
      loading.value = false;
      console.warn('updateOrderStatusAdmin: Korisnik nije administrator.');
      return false;
    }

    loading.value = true;
    error.value = null;
    try {
      const response = await axiosInstance.post<{ message: string, status?: number }>(
        API_URLS.ORDERS.UPDATE_STATUS,
        { order_id: orderId, status: newStatus }
      );

      if (response.data && (response.data.status === 200 || response.status === 200)) {
        // Ažuriraj status lokalno u `orders` nizu
        const orderIndex = orders.value.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
          // orders.value[orderIndex].status = newStatus; // Original method
          // Replace the order object to ensure reactivity
          const updatedOrder = {
            ...orders.value[orderIndex],
            status: newStatus,
          };
          orders.value.splice(orderIndex, 1, updatedOrder);
        }
        return true;
      } else {
        throw new Error(response.data.message || 'Nepoznata greška prilikom ažuriranja statusa porudžbine.');
      }
    } catch (err: any) {
      console.error('Greška pri ažuriranju statusa porudžbine (admin):', err);
      if (axios.isAxiosError(err) && err.response) {
        const apiError = err.response.data as ApiErrorResponse;
        error.value = apiError.message || 'Nije moguće ažurirati status porudžbine.';
      } else {
        error.value = err.message || 'Nije moguće ažurirati status porudžbine.';
      }
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    orders,
    loading,
    error,
    fetchUserOrders,
    fetchAllOrdersAdmin,
    createOrder, // Osiguraj da je createOrder ovde eksportovan
    updateOrderStatusAdmin, // Eksportuj novu akciju
  };
});
