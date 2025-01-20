import { defineStore } from 'pinia'

export interface CartItem {
  id: number
  name: string
  quantity: number
  price: number
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[]
  }),
  
  getters: {
    cartItems: (state) => state.items,
    isEmpty: (state) => state.items.length === 0
  },
  
  actions: {
    addItem(item: CartItem) {
      this.items.push(item)
    },
    clearCart() {
      this.items = []
    }
  }
})
