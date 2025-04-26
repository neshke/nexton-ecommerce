import { useAuthStore } from "@/stores/authStore";
import { ref } from "vue";

export class ActivityTracker {
  private static instance: ActivityTracker | null = null;
  private timeoutId: number | null = null;
  private isTracking = ref(false);

  // Set inactivity timeout to 15 minutes
  private readonly INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds

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
    console.info("Resetting inactivity timer");

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
    if (authStore.isAuthenticated) {
      console.log("Logging out due to inactivity");
      authStore.logout().then(() => {
        window.location.href = "/login?reason=inactivity";
      });
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

    // Remove existing event listeners if any
    this.stopTracking();

    const boundResetTimer = this.resetInactivityTimer.bind(this);
    
    // Add event listeners with properly bound context
    events.forEach((event) => {
      document.addEventListener(event, boundResetTimer);
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
    
    // Remove all event listeners
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];
    
    const boundResetTimer = this.resetInactivityTimer.bind(this);
    events.forEach((event) => {
      document.removeEventListener(event, boundResetTimer);
    });
  }
}

export const useActivityTracker = () => {
  return ActivityTracker.getInstance();
};
