import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import type { CartItem } from '@/models';
import type { Product } from '@/models/product';
import { useNotification } from '@/utils/notifications';

export const useCartStore = defineStore('cart', () => {
  const { showNotification } = useNotification();
  const cartItems = ref<CartItem[]>([]);
  
  // Get cart total
  const cartTotal = computed(() => {
    return cartItems.value.reduce((total : any, item : any) => {
      // Add null checks to prevent errors
      if (!item || !item.product) return total;
      
      const price = typeof item.product.cena === 'string' 
        ? parseFloat(item.product.cena) 
        : (item.product.cena || 0); // Default to 0 if price is undefined
      return total + (price * item.quantity);
    }, 0);
  });
  
  // Get total items count
  const itemCount = computed(() => {
    return cartItems.value.reduce((count : any, item : any) => count + (item ? item.quantity : 0), 0);
  });
  
  // Check if cart is empty
  const isEmpty = computed(() => cartItems.value.length === 0);
  
  // Initialize cart from localStorage
  const initializeCart = () => {
    try {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        cartItems.value = JSON.parse(storedCart);
        // Filter out any invalid items that don't have product data
        cartItems.value = cartItems.value.filter((item : any)=> item && item.product && item.product.id);
        
        // If the stored cart was corrupt or empty after filtering, clear it
        if (!Array.isArray(cartItems.value)) {
          console.error('Cart was not an array, resetting');
          cartItems.value = [];
          saveCart();
        }
      }
    } catch (error) {
      console.error('Failed to initialize cart:', error);
      // Reset cart if there's an error
      cartItems.value = [];
      localStorage.removeItem('cart');
    }
  };
  
  // Save cart to localStorage
  const saveCart = () => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems.value));
    } catch (error) {
      console.error('Failed to save cart:', error);
    }
  };
  
  // Add product to cart
  const addItem = (product: Product, quantity = 1, silent = false) => {
    addToCart({ product, quantity, silent });
  };
  
  // Add product to cart (using object parameter format)
  const addToCart = ({ product, quantity = 1, silent = false }: { product: Product; quantity?: number; silent?: boolean }) => {
    console.log('Adding product to cart:', product);

    // Ensure product is defined and has an id
    if (!product) {
      console.error('Attempted to add undefined product to cart');
      if (!silent) showNotification('Nemoguće dodati proizvod u korpu.', 'error');
      return;
    }

    // Use nullable check to ensure product.id exists
    const productId = product.id;
    if (!productId) {
      console.error('Attempted to add product without id to cart:', product);
      if (!silent) showNotification('Nemoguće dodati proizvod u korpu.', 'error');
      return;
    }

    const existingItem = cartItems.value.find((item : any) => item.product && item.product.id === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
      if (!silent) showNotification(`${product.naziv || 'Proizvod'} količina povećana (${existingItem.quantity}).`, 'success');
    } else {
      cartItems.value.push({
        id: Date.now(),  // Use timestamp as unique ID
        product,
        quantity
      });
      if (!silent) showNotification(`${product.naziv || 'Proizvod'} dodat u korpu.`, 'success');
    }
    
    saveCart();
  };
  
  // Update item quantity
  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity < 1) return;
    
    const item = cartItems.value.find((item : any)=> item.id === itemId);
    if (item) {
      item.quantity = quantity;
      saveCart();
    }
  };
  
  // Update item quantity by specific amount (can be negative)
  const updateItemQuantity = (itemId: number, amount: number) => {
    const item = cartItems.value.find((item : any)=> item.id === itemId);
    if (item) {
      const newQuantity = item.quantity + amount;
      if (newQuantity <= 0) {
        // Remove item if quantity would be zero or negative
        removeItem(itemId);
      } else {
        // Update quantity
        item.quantity = newQuantity;
        saveCart();
      }
    }
  };

  // Remove item from cart
  const removeItem = (itemId: number) => {
    const itemToRemove = cartItems.value.find((item : any) => item.id === itemId);
    cartItems.value = cartItems.value.filter((item : any)=> item.id !== itemId);
    saveCart();
    
    if (itemToRemove?.product?.naziv) {
      showNotification(`${itemToRemove.product.naziv} uklonjen iz korpe.`, 'success');
    }
  };

  // Remove product from cart (by product ID)
  const removeFromCart = (productId: number) => {
    console.log('Removing product with ID:', productId);
    cartItems.value = cartItems.value.filter((item : any )=> item.product && item.product.id !== productId);
    saveCart();
  };
  
  // Clear cart
  const clearCart = () => {
    cartItems.value = [];
    saveCart();
  };
  
  // Initialize cart when store is created
  initializeCart();
  
  return {
    cartItems,
    cartTotal,
    itemCount,
    isEmpty,
    initializeCart,
    addItem, // Keep the original method for backward compatibility
    addToCart,
    updateQuantity,
    updateItemQuantity,
    removeItem,
    removeFromCart,
    clearCart
  };
});
