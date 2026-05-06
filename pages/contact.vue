<template>
  <div class="contact-page">
    <div class="contact-card">
      <h1>Get in Touch</h1>
      <p class="subtitle">Have a secret spot to share? Or just want to say hello?</p>

      <form class="contact-form" @submit.prevent="handleSubmit">
        <div class="field">
          <label>Name</label>
          <input v-model="form.name" type="text" placeholder="Your name" required />
        </div>
        <div class="field">
          <label>Email</label>
          <input v-model="form.email" type="email" placeholder="your@email.com" required />
        </div>
        <div class="field">
          <label>Message</label>
          <textarea v-model="form.message" placeholder="Tell me something..." rows="5" required />
        </div>

        <!-- Cloudflare Turnstile widget -->
        <div ref="turnstileEl" class="turnstile-wrapper"></div>

        <button type="submit" :disabled="loading || !turnstileToken" class="btn-primary">
          {{ loading ? 'Sending...' : 'Send Message' }}
        </button>

        <p v-if="success" class="feedback success">Message sent! I'll get back to you soon. 🌿</p>
        <p v-if="error" class="feedback error">Something went wrong. Please try again.</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import emailjs from '@emailjs/browser';

const form = ref({ name: '', email: '', message: '' });
const loading = ref(false);
const success = ref(false);
const error = ref(false);

// Turnstile
const turnstileEl = ref<HTMLElement | null>(null);
const turnstileToken = ref<string | null>(null);
let widgetId: string | null = null;
// NOTE: Token verification is currently client-side only.
// This must be moved to a server endpoint (Nuxt server route) to prevent bypass.

onMounted(() => {
  // Load Turnstile script
  const script = document.createElement('script');
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
  script.async = true;
  script.defer = true;
  script.onload = () => {
    widgetId = (window as any).turnstile.render(turnstileEl.value, {
      sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
      callback: (token: string) => { turnstileToken.value = token; },
      'expired-callback': () => { turnstileToken.value = null; },
      'error-callback': () => { turnstileToken.value = null; },
    });
  };
  document.head.appendChild(script);
});

onUnmounted(() => {
  if (widgetId) (window as any).turnstile?.remove(widgetId);
});

const handleSubmit = async () => {
  if (!turnstileToken.value) return;

  loading.value = true;
  success.value = false;
  error.value = false;

  try {
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      {
        from_name: form.value.name,
        from_email: form.value.email,
        message: form.value.message,
      },
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    );

    success.value = true;
    form.value = { name: '', email: '', message: '' };
    // Reset turnstile for next submission
    (window as any).turnstile?.reset(widgetId);
    turnstileToken.value = null;
  } catch (e) {
    console.error('EmailJS error:', e);
    error.value = true;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.contact-page {
  min-height: 100svh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 6rem 1.5rem 4rem;
}

.contact-card {
  width: 100%;
  max-width: 520px;
}

h1 {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1c2a32;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #6b7280;
  margin-bottom: 2rem;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.turnstile-wrapper {
  display: flex;
  justify-content: center;
}

.feedback { text-align: center; font-size: 0.9rem; }
.success { color: #16a34a; }
.error { color: #dc2626; }
</style>