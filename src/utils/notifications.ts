import { ref } from 'vue';
import type { Notification } from '@/models/notification';

// Create a single, shared reactive state for the notification
const notification = ref<Notification | null>(null);
let timer: number | null = null;

export const useNotification = () => {
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info', timeout = 3000) => {
    // Clear any existing timeout
    if (timer !== null) {
      window.clearTimeout(timer);
      timer = null;
    }

    // Set the notification
    notification.value = { message, type };
    
    // Set a timeout to clear the notification
    timer = window.setTimeout(() => {
      notification.value = null;
    }, timeout);
  };

  const clearNotification = () => {
    notification.value = null;
    if (timer !== null) {
      window.clearTimeout(timer);
      timer = null;
    }
  };

  return {
    notification,
    showNotification,
    clearNotification
  };
};
