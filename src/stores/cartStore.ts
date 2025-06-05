import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import type { CartItem } from '@/models';
import type { Product } from '@/models/product';
import { useNotification } from '@/utils/notifications';

/**
 * Pinia store za upravljanje korpom za kupovinu.
 * Omogućava dodavanje, uklanjanje, ažuriranje količina proizvoda u korpi,
 * kao i izračunavanje ukupne cene i broja stavki.
 * Stanje korpe se čuva u localStorage-u.
 */
export const useCartStore = defineStore('cart', () => {
  const { showNotification } = useNotification();
  const cartItems = ref<CartItem[]>([]); // Niz stavki u korpi
  
  /**
   * Izračunava ukupnu vrednost svih stavki u korpi.
   * @returns number - Ukupna cena.
   */
  const cartTotal = computed(() => {
    return cartItems.value.reduce((total : any, item : any) => {
      if (!item || !item.product) return total;
      
      // Osigurava da je cena broj pre množenja
      const price = typeof item.product.cena === 'string' 
        ? parseFloat(item.product.cena) 
        : (item.product.cena || 0); 
      return total + (price * item.quantity);
    }, 0);
  });
  
  /**
   * Izračunava ukupan broj pojedinačnih proizvoda u korpi.
   * @returns number - Ukupan broj proizvoda.
   */
  const itemCount = computed(() => {
    return cartItems.value.reduce((count : any, item : any) => count + (item ? item.quantity : 0), 0);
  });
  
  /**
   * Proverava da li je korpa prazna.
   * @returns boolean - True ako je korpa prazna, inače false.
   */
  const isEmpty = computed(() => cartItems.value.length === 0);
  
  /**
   * Inicijalizuje stanje korpe iz localStorage-a.
   * Ako postoje sačuvane stavke, učitava ih.
   * U slučaju greške ili nevalidnih podataka, korpa se resetuje.
   */
  const initializeCart = () => {
    try {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        let parsedCart = JSON.parse(storedCart);
        // Filtriranje nevalidnih stavki koje nemaju proizvod ili ID proizvoda
        parsedCart = parsedCart.filter((item : any)=> item && item.product && typeof item.product.id !== 'undefined');
        
        if (!Array.isArray(parsedCart)) {
          console.error('Podaci iz korpe nisu niz, korpa se resetuje.');
          cartItems.value = [];
        } else {
          cartItems.value = parsedCart;
        }
      } else {
        cartItems.value = []; // Ako nema sačuvane korpe, inicijalizuj kao prazan niz
      }
    } catch (error) {
      console.error('Greška pri inicijalizaciji korpe:', error);
      cartItems.value = []; // Resetuj korpu u slučaju greške
      localStorage.removeItem('cart'); // Ukloni nevalidne podatke iz localStorage
    }
    saveCart(); // Sačuvaj (potencijalno ispravljeno ili prazno) stanje
  };
  
  /**
   * Čuva trenutno stanje korpe u localStorage.
   */
  const saveCart = () => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems.value));
    } catch (error) {
      console.error('Greška pri čuvanju korpe:', error);
    }
  };
  
  /**
   * Dodaje proizvod u korpu ili povećava količinu ako već postoji.
   * @param product - Proizvod koji se dodaje.
   * @param quantity - Količina proizvoda (podrazumevano 1).
   * @param silent - Ako je true, notifikacija o dodavanju se neće prikazati (podrazumevano false).
   */
  const addItem = (product: Product, quantity = 1, silent = false) => {
    addToCart({ product, quantity, silent });
  };
  
  /**
   * Interna metoda za dodavanje proizvoda u korpu.
   * @param options - Objekat sa proizvodom, količinom i silent flag-om.
   */
  const addToCart = ({ product, quantity = 1, silent = false }: { product: Product; quantity?: number; silent?: boolean }) => {
    if (!product || typeof product.id === 'undefined') {
      console.error('Pokušaj dodavanja nevalidnog proizvoda u korpu:', product);
      if (!silent) showNotification('Nemoguće dodati proizvod u korpu (nevalidan proizvod).', 'error');
      return;
    }

    const existingItem = cartItems.value.find((item : any) => item.product && item.product.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
      if (!silent) showNotification(`${product.naziv || 'Proizvod'} količina ažurirana na ${existingItem.quantity}.`, 'success');
    } else {
      cartItems.value.push({
        id: Date.now(), // Jedinstveni ID za stavku u korpi
        product,
        quantity
      });
      if (!silent) showNotification(`${product.naziv || 'Proizvod'} dodat u korpu.`, 'success');
    }
    
    saveCart();
  };
  
  /**
   * Ažurira količinu za određenu stavku u korpi.
   * @param itemId - ID stavke u korpi.
   * @param quantity - Nova količina. Ako je manja od 1, stavka se ne menja.
   */
  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity < 1) return; // Količina ne može biti manja od 1
    
    const item = cartItems.value.find((item : any)=> item.id === itemId);
    if (item) {
      item.quantity = quantity;
      saveCart();
    }
  };
  
  /**
   * Povećava ili smanjuje količinu stavke u korpi za određeni iznos.
   * Ako nova količina postane 0 ili manja, stavka se uklanja iz korpe.
   * @param itemId - ID stavke u korpi.
   * @param amount - Iznos za koji se menja količina (može biti negativan).
   */
  const updateItemQuantity = (itemId: number, amount: number) => {
    const item = cartItems.value.find((item : any)=> item.id === itemId);
    if (item) {
      const newQuantity = item.quantity + amount;
      if (newQuantity <= 0) {
        removeItem(itemId); // Ukloni stavku ako je količina 0 ili manja
      } else {
        item.quantity = newQuantity;
        saveCart();
      }
    }
  };

  /**
   * Uklanja stavku iz korpe na osnovu njenog ID-a.
   * @param itemId - ID stavke koja se uklanja.
   */
  const removeItem = (itemId: number) => {
    const itemIndex = cartItems.value.findIndex((item : any) => item.id === itemId);
    if (itemIndex > -1) {
      const itemToRemove = cartItems.value[itemIndex];
      cartItems.value.splice(itemIndex, 1);
      saveCart();
      if (itemToRemove?.product?.naziv) {
        showNotification(`${itemToRemove.product.naziv} uklonjen iz korpe.`, 'success');
      }
    } else {
      console.warn(`Pokušaj uklanjanja nepostojeće stavke (ID: ${itemId}) iz korpe.`);
    }
  };

  /**
   * Uklanja sve stavke određenog proizvoda iz korpe na osnovu ID-a proizvoda.
   * @param productId - ID proizvoda koji se uklanja.
   */
  const removeFromCart = (productId: number) => {
    const initialLength = cartItems.value.length;
    cartItems.value = cartItems.value.filter((item : any )=> !(item.product && item.product.id === productId));
    if (cartItems.value.length < initialLength) {
      saveCart();
      // Može se dodati notifikacija ako je potrebno
      console.log(`Sve stavke proizvoda sa ID ${productId} su uklonjene.`);
    }
  };
  
  /**
   * Prazni celu korpu.
   */
  const clearCart = () => {
    cartItems.value = [];
    saveCart();
    showNotification('Korpa je ispražnjena.', 'info');
  };
  
  initializeCart(); // Inicijalizacija korpe prilikom kreiranja stora
  
  return {
    cartItems,
    cartTotal,
    itemCount,
    isEmpty,
    initializeCart,
    addItem,
    addToCart,
    updateQuantity,
    updateItemQuantity,
    removeItem,
    removeFromCart,
    clearCart
  };
});
