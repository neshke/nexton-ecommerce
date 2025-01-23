import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "vue-router";
import { ref } from "vue";

export class ActivityTracker {
  private static instance: ActivityTracker | null = null;
  private timeoutId: number | null = null;
  private isTracking = ref(false);

  private readonly INACTIVITY_TIMEOUT = 15 * 60 * 1000;

  private constructor() {
    // Remove initialization from constructor
  }

  public static getInstance(): ActivityTracker {
    if (!ActivityTracker.instance) {
      ActivityTracker.instance = new ActivityTracker();
    }
    return ActivityTracker.instance;
  }

  private resetInactivityTimer(): void {
    console.log("Resetting inactivity timer");

    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
    }

    this.timeoutId = window.setTimeout(() => {
      console.log("Inactivity timeout reached!");
      this.handleInactivity();
    }, this.INACTIVITY_TIMEOUT);
  }

  private handleInactivity(): void {
    const authStore = useAuthStore();
    if (authStore.isAuthenticated()) {
      console.log("Logging out due to inactivity");
      authStore.logout();
      this.stopTracking();
      window.location.href = "/login";
    }
  }

  public startTracking(): void {
    console.log("Starting activity tracking");
    this.isTracking.value = true;

    // Setup event listeners when starting tracking
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      document.addEventListener(event, () => {
        if (this.isTracking.value) {
          this.resetInactivityTimer();
        }
      });
    });

    // Initial timer setup
    this.resetInactivityTimer();
  }

  public stopTracking(): void {
    console.log("Stopping activity tracking");
    this.isTracking.value = false;
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}

export const useActivityTracker = () => {
  return ActivityTracker.getInstance();
};
