<template>
  <div class="contact-page">
    <Header title="Kontaktirajte" highlighted="Nas" subtitle="Stupite u kontakt sa našim timom" />
    <main class="main-content container">
      <div class="contact-grid">
        <!-- Info Section -->
        <div class="contact-info">
          <h2>Kontaktirajte Nas</h2>
          <br />
          <div class="info-items">
            <ContactInfoItem v-for="(item, index) in contactInfo" :key="index" :icon="item.icon" :title="item.title"
              :details="item.details" :delay="index * 0.2" />
          </div>
        </div>

        <!-- Contact Form -->
        <form class="contact-form animate-slide-left" @submit.prevent="handleSubmit">
          <h2>Pošaljite nam poruku</h2>
          <div class="form-group" v-for="field in formFields" :key="field.id">
            <label :for="field.id">{{ field.label }}</label>
            <component :is="field.type === 'textarea' ? 'textarea' : 'input'" :id="field.id" :type="field.inputType"
              v-model="form[field.id]" :placeholder="field.placeholder" required @blur="validateField(field.id)" />
            <span class="error" v-if="formErrors[field.id]">{{
              formErrors[field.id]
            }}</span>
          </div>
          <button type="submit" class="submit-btn">
            <span>Pošalji poruku</span>
            <i class="fas fa-paper-plane"></i>
          </button>
        </form>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script lang="ts">
import { ref } from "vue";
import { useNotification } from "@/utils/notifications";
import type { ContactFormData } from "@/models";
import Footer from "@/components/Footer.vue";
import Header from '@/components/Header.vue';
import ContactInfoItem from "@/components/ContactInfoItem.vue";

export default {
  components: {
    Footer,
    Header,
    ContactInfoItem
  },
  setup() {
    // Podaci za kontakt informacije
    const contactInfo = [
      {
        icon: "map-marker-alt",
        title: "Adresa",
        details: ["123 Glavna Ulica", "11000 Beograd, Srbija"]
      },
      {
        icon: "phone-alt",
        title: "Telefon",
        details: ["+381 11 123 4567", "+381 63 789 0123"]
      },
      {
        icon: "envelope",
        title: "Email",
        details: ["kontakt@ecommerce.com", "podrska@ecommerce.com"]
      }
    ];

    // Struktura forme za kontakt
    const formFields = [
      { id: "name", label: "Vaše ime", placeholder: "Unesite vaše ime", type: "input", inputType: "text" },
      { id: "email", label: "Email", placeholder: "Unesite vaš email", type: "input", inputType: "email" },
      { id: "message", label: "Poruka", placeholder: "Unesite vašu poruku", type: "textarea" }
    ];

    // Početno stanje forme
    const form = ref<ContactFormData>({
      name: "",
      email: "",
      message: ""
    });

    // Greške forme
    const formErrors = ref<Record<string, string>>({});

    // Stanje slanja forme
    const isSubmitting = ref(false);

    const { showNotification } = useNotification();

    // Validacija polja
    const validateField = (field: string) => {
      formErrors.value[field] = "";

      if (!form.value[field]) {
        formErrors.value[field] = "Ovo polje je obavezno";
        return false;
      }

      if (field === "email") {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(form.value.email)) {
          formErrors.value.email = "Unesite validnu email adresu";
          return false;
        }
      }

      return true;
    };

    // Validacija cele forme
    const validateForm = () => {
      const fields = Object.keys(form.value) as Array<keyof typeof form.value>;
      let isValid = true;

      fields.forEach((field) => {
        if (!validateField(field as string)) {
          isValid = false;
        }
      });

      return isValid;
    };

    // Slanje forme
    const handleSubmit = () => {
      if (!validateForm()) return;

      isSubmitting.value = true;

      // Simulacija slanja poruke - ovde bi se normalno povezali sa API-jem
      setTimeout(() => {
        showNotification("Vaša poruka je uspešno poslata!", "success");

        // Resetuje formu
        form.value = {
          name: "",
          email: "",
          message: ""
        };

        isSubmitting.value = false;
      }, 1000);
    };

    return {
      contactInfo,
      formFields,
      form,
      formErrors,
      isSubmitting,
      validateField,
      handleSubmit
    };
  }
}
</script>

<style scoped>
.contact-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* Fix footer to always be at bottom */
:deep(.footer) {
  margin-top: auto;
}

.hero {
  padding: clamp(3rem, 8vw, 6rem) 2rem;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  text-align: center;
}

.hero h1 {
  font-size: clamp(2rem, 5vw, 3rem);
  margin-bottom: 1rem;
}

.highlight {
  color: #ffd700;
}

.container {
  width: 100%;
  padding: clamp(2rem, 5vw, 4rem);
  max-width: 100%;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 500px), 1fr));
  gap: clamp(2rem, 5vw, 4rem);
  align-items: center;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  justify-content: center;
}

.contact-form {
  background: white;
  padding: clamp(1.5rem, 3vw, 3rem);
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 700px;
  width: 100%;
  margin: 0 auto;
}

.contact-info {
  max-width: 700px;
  width: 100%;
  margin: 0 auto;
  padding: clamp(1.5rem, 3vw, 2rem);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #4a5568;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

textarea {
  min-height: 150px;
  resize: vertical;
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

@media (max-width: 768px) {
  .contact-grid {
    grid-template-columns: 1fr;
  }

  .form-group input,
  .form-group textarea {
    padding: 0.875rem;
  }
}

/* Animations */
.animate-fade-in {
  animation: fadeIn 1s ease-out forwards;
}

.animate-slide-left {
  animation: slideLeft 1s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideLeft {
  from {
    opacity: 0;
    transform: translateX(30px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.info-items {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  /* Add consistent gap between items */
}

/* Add these new animation classes */
.animate-slide-down {
  animation: slideDown 1s ease-out forwards;
  opacity: 0;
}

.animate-slide-up {
  animation: slideUp 1s ease-out 0.3s backwards;
}

/* Add these new keyframes */
@keyframes slideDown {
  from {
    transform: translateY(-30px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
