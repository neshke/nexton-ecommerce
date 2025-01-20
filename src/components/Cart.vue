<template>
  <div class="cart">
    <h2>Shopping Cart</h2>
    <div v-if="cartItems.length">
      <div v-for="item in cartItems" :key="item.id" class="cart-item">
        <img :src="item.image" :alt="item.name" />
        <div class="item-details">
          <h3>{{ item.name }}</h3>
          <p>{{ item.price }}</p>
          <button @click="removeFromCart(item)">Remove</button>
        </div>
      </div>
    </div>
    <div v-else>
      <p>Your cart is empty</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";

export default {
  setup() {
    const cartItems = ref([]);

    onMounted(() => {
      try {
        cartItems.value = JSON.parse(localStorage.getItem("cart") || "[]");
      } catch (error) {
        console.error("Error loading cart:", error);
      }
    });

    const removeFromCart = (item) => {
      cartItems.value = cartItems.value.filter((i) => i.id !== item.id);
      localStorage.setItem("cart", JSON.stringify(cartItems.value));
    };

    return {
      cartItems,
      removeFromCart
    }
  }
}
</script>

<style scoped>
.cart {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.cart-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.cart-item img {
  width: 100px;
  height: 100px;
  object-fit: contain;
}
</style>
