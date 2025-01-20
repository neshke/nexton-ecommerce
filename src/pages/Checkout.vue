<template>
  <div class="checkout">
    <h2>Checkout</h2>
    <form @submit.prevent="submitOrder">
      <label>
        Name:
        <input v-model="name" type="text" required />
      </label>
      <label>
        Address:
        <input v-model="address" type="text" required />
      </label>
      <label>
        Phone Number:
        <input v-model="phone" type="text" required />
      </label>
      <button type="submit">Place Order</button>
    </form>
    <div class="order-summary">
      <h3>Order Summary</h3>
      <div v-if="cartItems && cartItems.length > 0">
        <div v-for="item in cartItems" :key="item.id">
          <p>{{ item.name }} - {{ item.quantity }}</p>
        </div>
      </div>
      <p v-else>Your cart is empty</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useCartStore } from '../stores/cartStore';
import { storeToRefs } from 'pinia';

const cartStore = useCartStore();
const { cartItems } = storeToRefs(cartStore);
const name = ref("");
const address = ref("");
const phone = ref("");

const submitOrder = () => {
  try {
    if (cartStore.isEmpty) {
      throw new Error("Cart is empty!");
    }
    // Implement order submission
    cartStore.clearCart();
  } catch (error) {
    console.error(error);
    alert(error instanceof Error ? error.message : 'An error occurred');
  }
};
</script>

<style scoped>
.checkout {
  padding: 16px;
}
.checkout form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.order-summary {
  margin-top: 16px;
}
</style>
