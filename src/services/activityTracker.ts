import { useAuthStore } from "@/stores/authStore";
import { ref } from "vue";

/**
 * Singleton klasa za praćenje neaktivnosti korisnika.
 * Automatski odjavljuje korisnika nakon određenog perioda neaktivnosti.
 */
export class ActivityTracker {
  private static instance: ActivityTracker | null = null;
  private timeoutId: number | null = null;
  private isTracking = ref(false);
  private boundResetTimer: () => void;

  // Period neaktivnosti nakon kojeg se korisnik odjavljuje (15 minuta).
  private readonly INACTIVITY_TIMEOUT = 15 * 60 * 1000;

  private constructor() {
    this.boundResetTimer = this.resetInactivityTimer.bind(this);
  }

  /**
   * Vraća Singleton instancu ActivityTracker-a.
   */
  public static getInstance(): ActivityTracker {
    if (!ActivityTracker.instance) {
      ActivityTracker.instance = new ActivityTracker();
    }
    return ActivityTracker.instance;
  }

  /**
   * Resetuje tajmer za praćenje neaktivnosti.
   * Poziva se prilikom korisničke aktivnosti.
   */
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

  /**
   * Rukuje događajem kada istekne period neaktivnosti.
   * Odjavljuje korisnika ako je autentifikovan.
   */
  private handleInactivity(): void {
    const authStore = useAuthStore();
    if (authStore.isAuthenticated) {
      console.log("Logging out due to inactivity");
      authStore.logout().then(() => {
        window.location.href = "/login?reason=inactivity"; // Preusmeravanje na login stranicu
      });
    } else {
      console.log("Handle inactivity called, but user is not authenticated.");
    }
  }

  /**
   * Pokreće praćenje korisničke aktivnosti.
   * Postavlja event listenere za detekciju aktivnosti.
   */
  public startTracking(): void {
    console.log("Starting activity tracking");
    this.isTracking.value = true;

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Uklanjanje postojećih listener-a pre dodavanja novih
    events.forEach((event) => {
      document.removeEventListener(event, this.boundResetTimer);
      document.addEventListener(event, this.boundResetTimer);
    });

    this.resetInactivityTimer(); // Inicijalno postavljanje tajmera
  }

  /**
   * Zaustavlja praćenje korisničke aktivnosti.
   * Uklanja event listenere i briše tajmer.
   */
  public stopTracking(): void {
    console.log("Stopping activity tracking");
    this.isTracking.value = false;
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];
    
    events.forEach((event) => {
      document.removeEventListener(event, this.boundResetTimer);
    });
  }
}

/**
 * Kompozitna funkcija za dobijanje instance ActivityTracker-a.
 */
export const useActivityTracker = () => {
  return ActivityTracker.getInstance();
};
