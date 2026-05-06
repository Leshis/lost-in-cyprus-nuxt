<template>
  <footer class="site-footer">
    <div class="footer-content">
      <div class="footer-links">
        <router-link to="/about">About</router-link>
        <router-link to="/contact">Contact</router-link>
        <router-link to="/privacypolicy">Privacy Policy</router-link>
      </div>

      <div class="footer-socials">
        <a href="https://instagram.com/lostincyprus" target="_blank" aria-label="Instagram">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
          Instagram
        </a>
        <a href="https://tiktok.com/@lostincyprus" target="_blank" aria-label="TikTok">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
          </svg>
          TikTok
        </a>
      </div>

      <p class="footer-copy">&copy; {{ currentYear }} Lost in Cyprus</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>
.site-footer {
  position: relative;
  padding: 2rem 1.5rem 2rem;
  text-align: center;

  /* Fade in from the page background */
  background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.04) 40%, rgba(0, 0, 0, 0.07));
}

/* Top fade shadow line */
.site-footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(0, 0, 0, 0.08), transparent);
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.footer-links,
.footer-socials {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.footer-links a,
.footer-socials a {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #6b7280;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-links a:hover,
.footer-socials a:hover {
  color: #b57b52;
}

.footer-socials {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  padding-top: 1rem;
}

.footer-copy {
  font-size: 0.75rem;
  color: #9ca3af;
}
</style>