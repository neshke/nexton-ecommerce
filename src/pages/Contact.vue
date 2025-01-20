<template>
  <div class="contact-page">
    <header class="hero animate-fade-in">
      <div class="hero-content">
        <h1>Contact <span class="highlight">Us</span></h1>
        <p>Get in touch with our team</p>
      </div>
    </header>

    <main class="main-content container">
      <div class="contact-grid">
        <!-- Info Section -->
        <div class="contact-info">
          <h2>Get In Touch</h2>
          <br />
          <div class="info-items">
            <ContactInfoItem
              v-for="(item, index) in contactInfo"
              :key="index"
              :icon="item.icon"
              :title="item.title"
              :details="item.details"
              :delay="index * 0.2"
            />
          </div>
        </div>

        <!-- Contact Form -->
        <form
          class="contact-form animate-slide-left"
          @submit.prevent="handleSubmit"
        >
          <h2>Send us a Message</h2>
          <div class="form-group" v-for="field in formFields" :key="field.id">
            <label :for="field.id">{{ field.label }}</label>
            <component
              :is="field.type === 'textarea' ? 'textarea' : 'input'"
              :id="field.id"
              :type="field.inputType"
              v-model="form[field.id]"
              :placeholder="field.placeholder"
              required
              @blur="validateField(field.id)"
            />
            <span class="error" v-if="formErrors[field.id]">{{ formErrors[field.id] }}</span>
          </div>
          <button type="submit" class="submit-btn">
            <span>Send Message</span>
            <i class="fas fa-paper-plane"></i>
          </button>
        </form>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useNotification } from "@/utils/notifications";
import Footer from "@/components/Footer.vue";
import ContactInfoItem from "@/components/ContactInfoItem.vue";

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface FormField {
  id: keyof FormData;
  label: string;
  inputType?: string;
  placeholder: string;
  type: 'input' | 'textarea';
}

const { showNotification } = useNotification();

const form = ref<FormData>({
  name: "",
  email: "",
  message: "",
});

const formErrors = ref<{ [key: string]: string }>({});

const validateField = (key: keyof FormData) => {
  if (!form.value[key]) {
    formErrors.value[String(key)] = `${key} is required`;
  } else {
    delete formErrors.value[String(key)];
  };
};

const contactInfo = [
  {
    icon: "map-marker-alt",
    title: "Visit Us",
    details: ["123 Commerce Street", "Business City, 12345"],
  },
  {
    icon: "phone",
    title: "Call Us",
    details: ["+1 (234) 567-8900", "Mon - Fri, 9am - 6pm"],
  },
  {
    icon: "envelope",
    title: "Email Us",
    details: ["contact@ecommerce.com", "support@ecommerce.com"],
  },
];

const formFields: FormField[] = [
  {
    id: "name",
    label: "Name",
    inputType: "text",
    placeholder: "Your name",
    type: "input",
  },
  {
    id: "email",
    label: "Email",
    inputType: "email",
    placeholder: "your@email.com",
    type: "input",
  },
  {
    id: "message",
    label: "Message",
    placeholder: "How can we help you?",
    type: "textarea",
  },
];

const handleSubmit = () => {
  // Validate all fields before submission
  Object.keys(form.value).forEach((key) => validateField(key as keyof FormData));
  if (Object.keys(formErrors.value).length === 0) {
    showNotification("Message sent successfully!", "success");
    form.value = { name: "", email: "", message: "" };
  }
};
</script>

<style scoped>
.contact-page {
  min-height: 100vh;
  background-color: #f8f9fa;
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
  max-width: 1200px;
  margin: 0 auto;
  padding: clamp(2rem, 5vw, 4rem);
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 500px), 1fr));
  gap: clamp(2rem, 5vw, 4rem);
  align-items: start;
}

.contact-form {
  background: white;
  padding: clamp(1.5rem, 3vw, 3rem);
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
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
  gap: 2rem; /* Add consistent gap between items */
}
</style>
