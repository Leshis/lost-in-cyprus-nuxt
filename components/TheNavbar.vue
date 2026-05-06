<template>
  <nav class="navbar">
    <div class="nav-content">
      <router-link to="/" class="logo-link">
        <img src="/lost-in-cyprus.png" alt="Logo" class="cyprus-icon" />
      </router-link>

      <div class="desktop-nav">
        <button v-if="showBack" class="nav-back-btn" @click="router.back()">← Back</button>

        <SearchBar variant="nav" />

        <router-link to="/about" class="nav-link">About</router-link>
        <router-link to="/contact" class="nav-link">Contact</router-link>
        <router-link to="/privacypolicy" class="nav-link">Privacy Policy</router-link>
      </div>

      <button type="button" class="hamburger-trigger" aria-label="Open menu" @click="emit('openMenu')">
        <div class="hamburger-lines">
          <span></span><span></span><span></span>
        </div>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SearchBar from './SearchBar.vue';

const emit = defineEmits<{ openMenu: [] }>();

const router = useRouter();
const route = useRoute();

const showBack = computed(() => route.name === 'Article');
</script>

<style scoped>
/* ── Navbar ───────────────────────────── */
.navbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 50;
  padding: 0 40px;
  height: 68px;
  display: flex;
  align-items: center;
  background: rgba(248, 246, 240, 0.85);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.nav-content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-link { display: flex; align-items: center; }
.cyprus-icon { height: 36px; width: auto; }

/* ── Desktop nav ──────────────────────── */
.desktop-nav { display: flex; align-items: center; gap: 12px; }

.nav-link {
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #3d3d3d;
  text-decoration: none;
  transition: background 0.2s, color 0.2s;
}
.nav-link:hover { background: rgba(0, 0, 0, 0.06); }
.nav-link.router-link-active { background: #b57b52; color: white; }

.nav-back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  padding: 6px 16px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #3d3d3d;
  cursor: pointer;
  transition: background 0.2s;
}
.nav-back-btn:hover { background: rgba(0, 0, 0, 0.06); }

/* ── Hamburger (mobile only) ──────────── */
.hamburger-trigger {
  display: none;
  background: white; border: 1px solid #eee;
  width: 42px; height: 42px; border-radius: 50%;
  justify-content: center; align-items: center; cursor: pointer;
}
.hamburger-lines { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.hamburger-lines span { display: block; width: 18px; height: 2px; background: #1c2a32; border-radius: 2px; }

/* ── Mobile ───────────────────────────── */
@media (max-width: 768px) {
  .navbar {
    background: transparent; backdrop-filter: none;
    border-bottom: none; padding: 0;
    height: auto; top: 20px;
    left: 5%; right: 5%;
    max-width: 400px; margin: 0 auto;
  }
  .desktop-nav { display: none; }
  .hamburger-trigger { display: flex; }
}
</style>