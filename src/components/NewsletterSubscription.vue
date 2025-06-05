<template>
  <section class="newsletter animate-fade-in">
    <div class="newsletter-content">
      <h2>Ostanite Informisani</h2>
      <p>Pretplatite se na naš newsletter za ekskluzivne ponude i novosti</p>
      <form class="newsletter-form" @submit.prevent="handleSubscribe">
        <input type="email" v-model="email" placeholder="Unesite vaš email" required />
        <button type="submit">Pretplati se</button>
      </form>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'NewsletterSubscription',
  setup() {
    const email = ref('');

    const handleSubscribe = () => {
      if (email.value) {
        // Basic email validation (can be expanded)
        if (!/^\S+@\S+\.\S+$/.test(email.value)) {
          alert('Molimo unesite validnu email adresu.');
          return;
        }
        // Handle newsletter subscription logic here
        console.log('Subscribing with email:', email.value);
        alert(`Hvala vam što ste se pretplatili sa ${email.value}!`);
        email.value = ''; // Clear input after submission
      } else {
        alert('Molimo unesite vašu email adresu.');
      }
    };

    return {
      email,
      handleSubscribe,
    };
  },
});
</script>

<style scoped>
.newsletter {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  padding: 4rem 2rem;
  color: white;
  text-align: center;
}

.newsletter-content {
  max-width: 600px;
  margin: 0 auto;
}

.newsletter-content h2 {
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  margin-bottom: 1rem;
  font-weight: 700;
}

.newsletter-content p {
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  margin-bottom: 2rem;
  opacity: 0.9;
}

.newsletter-form {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding: 0 clamp(1rem, 3vw, 2rem);
}

.newsletter-form input {
  flex: 1;
  padding: 1rem;
  font-size: 1em;
  border: none;
  border-radius: 30px;
  min-width: 200px;
  /* Ensure input has a minimum width */
}

.newsletter-form button {
  padding: 1rem 2rem;
  font-size: 1em;
  background-color: #ffd700;
  color: #2d3748;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
  font-weight: 600;
}

.newsletter-form button:hover {
  transform: translateY(-2px);
  background-color: #f0c800;
  /* Darken button on hover */
}

/* Base Animation Class */
.animate-fade-in {
  animation: fadeIn 1s ease-out forwards;
}

/* Animation Keyframes */
@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .newsletter-form {
    flex-direction: column;
  }

  .newsletter-form input {
    width: 100%;
    box-sizing: border-box;
    /* Ensure padding doesn't break layout */
  }

  .newsletter-form button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .newsletter {
    padding: 3rem 1rem;
  }

  .newsletter-form {
    gap: 0.5rem;
  }

  .newsletter-form input,
  .newsletter-form button {
    font-size: 0.9em;
    padding: 0.8rem 1.5rem;
  }
}
</style>
