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
          
          <div class="form-group">
            <label for="name">Vaše ime</label>
            <input 
              type="text" 
              id="name" 
              v-model="form.name" 
              placeholder="Unesite vaše ime" 
              :class="{ 'invalid': errors.name }"
              @blur="validateField('name')"
              @focus="clearError('name')" 
            />
            <span class="error" v-if="errors.name">{{ errors.name }}</span>
          </div>
          
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              v-model="form.email" 
              placeholder="Unesite vaš email"
              :class="{ 'invalid': errors.email }"
              @blur="validateField('email')"
              @focus="clearError('email')"
            />
            <span class="error" v-if="errors.email">{{ errors.email }}</span>
          </div>
          
          <div class="form-group">
            <label for="message">Poruka</label>
            <textarea 
              id="message" 
              v-model="form.message"
              placeholder="Unesite vašu poruku"
              :class="{ 'invalid': errors.message }"
              @blur="validateField('message')"
              @focus="clearError('message')"
            ></textarea>
            <span class="error" v-if="errors.message">{{ errors.message }}</span>
          </div>

          <button type="submit" class="submit-btn" :disabled="isSubmitting">
            <span>{{ isSubmitting ? 'Slanje...' : 'Pošalji poruku' }}</span>
            <i :class="isSubmitting ? 'fas fa-spinner fa-spin' : 'fas fa-paper-plane'"></i>
          </button>
          
          <div v-if="submitStatus.show" :class="['submit-status', submitStatus.type]" role="alert">
            <i :class="submitStatus.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
            <span>{{ submitStatus.message }}</span>
          </div>
        </form>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script lang="ts">
import { ref, reactive } from "vue";
import { useNotification } from "@/utils/notifications";
import type { ContactFormData } from "@/models";
import Footer from "@/components/Footer.vue";
import Header from '@/components/Header.vue';
import ContactInfoItem from "@/components/ContactInfoItem.vue";
import axiosInstance from "@/config/axios";
import { API_URLS } from "@/config/api";

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

    // Početno stanje forme
    const form = reactive<ContactFormData>({
      name: "",
      email: "",
      message: ""
    });

    // Greške forme - using reactive to avoid typescript errors
    const errors = reactive<Record<string, string>>({
      name: "",
      email: "",
      message: ""
    });
    
    // Status slanja forme
    const submitStatus = reactive({
      show: false,
      type: '',
      message: ''
    });

    // Stanje slanja forme
    const isSubmitting = ref(false);
    
    const { showNotification } = useNotification();
    
    // Clear error when field is focused
    const clearError = (field: string) => {
      errors[field] = "";
    };
    
    // Validate a single field
    const validateField = (field: string) => {
      // Clear any previous errors first
      errors[field] = "";
      
      const value = form[field as keyof ContactFormData];
      
      // Check if field is empty
      if (!value || value.trim() === "") {
        errors[field] = "Ovo polje je obavezno";
        return false;
      }
      
      // Special validation for email field
      if (field === "email") {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
          errors["email"] = "Unesite validnu email adresu";
          return false;
        }
      }
      
      return true;
    };

    // Validate the entire form
    const validateForm = () => {
      let isValid = true;
      
      // Validate each field
      ["name", "email", "message"].forEach(field => {
        if (!validateField(field)) {
          isValid = false;
        }
      });
      
      return isValid;
    };
    
    // Form submission
    const handleSubmit = async () => {
      // Reset submission status
      submitStatus.show = false;
      submitStatus.type = "";
      submitStatus.message = "";
      
      // Validate the form before submitting
      if (!validateForm()) {
        showNotification('Molimo ispravite greške u formi', 'error');
        submitStatus.show = true;
        submitStatus.type = "error";
        submitStatus.message = "Molimo ispravite greške u formi";
        return;
      }
      
      isSubmitting.value = true;
      
      try {
        // Call the API to send the email message
        const response = await axiosInstance.post(API_URLS.CONTACT.SEND_MESSAGE, form);
        
        if (response.data.status === 200) {
          showNotification("Vaša poruka je uspešno poslata!", "success");
          submitStatus.show = true;
          submitStatus.type = "success";
          submitStatus.message = "Vaša poruka je uspešno poslata! Uskoro ćemo Vas kontaktirati.";
          
          // Reset the form
          form.name = "";
          form.email = "";
          form.message = "";
          
        } else {
          throw new Error(response.data.message || "Došlo je do greške prilikom slanja poruke");
        }
      } catch (error: any) {
        console.error("Greška prilikom slanja poruke:", error);
        const errorMsg = error.response?.data?.message || error.message || "Došlo je do greške prilikom slanja poruke";
        
        showNotification(errorMsg, "error");
        submitStatus.show = true;
        submitStatus.type = "error";
        submitStatus.message = errorMsg;
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      contactInfo,
      form,
      errors,
      isSubmitting,
      submitStatus,
      validateField,
      clearError,
      handleSubmit
    };
  }
};
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

.form-group input:focus,
.form-group textarea:focus {
  border-color: #6366f1;
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
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

.submit-btn:disabled {
  background: #a5b4fc;
  cursor: not-allowed;
  opacity: 0.8;
}

.submit-btn:hover:not(:disabled) {
  background: #4f46e5;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(99, 102, 241, 0.25);
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

/* Error message styling */
.error {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
  animation: fadeIn 0.3s ease;
}

.form-group input.invalid,
.form-group textarea.invalid {
  border-color: #ef4444;
  box-shadow: 0 0 0 1px #ef4444;
}

/* Submit status styling */
.submit-status {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: fadeIn 0.5s ease;
  font-weight: 500;
}

.submit-status.success {
  background-color: #dcfce7;
  color: #16a34a;
  border: 1px solid #86efac;
}

.submit-status.error {
  background-color: #fee2e2;
  color: #dc2626;
  border: 1px solid #fca5a5;
}

.submit-status i {
  font-size: 1.25rem;
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
}
</style>
