<template>
  <Teleport to="body">
    <div
      :class="['menu-overlay', { 'is-active': isOpen }]"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      @keydown.esc="emit('close')"
      @click.self="emit('close')"
    >
      <div class="menu-card">
        <div class="menu-header">
          <img src="/lost-in-cyprus.png" class="menu-logo-small" alt="Lost in Cyprus" />
          <button class="close-x" @click="emit('close')" aria-label="Close menu">✕</button>
        </div>

        <div class="menu-body">
          <router-link to="/about" class="menu-item" @click="emit('close')">ABOUT ME</router-link>
          <router-link to="/contact" class="menu-item" @click="emit('close')">CONTACT</router-link>
          <router-link to="/privacypolicy" class="menu-item" @click="emit('close')">PRIVACY POLICY</router-link>
          <SearchBar />
        </div>

        <div class="menu-footer">
          <p>Discover the unexpected.</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import SearchBar from './SearchBar.vue'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<style scoped>
/* Mobile base */
.menu-overlay {
  position: fixed;
  inset: 0;
  background: rgba(28, 42, 50, 0.4);
  backdrop-filter: blur(8px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.menu-overlay.is-active {
  opacity: 1;
  pointer-events: auto;
}

.menu-card {
  width: 92%;
  background: white;
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  transform: scale(0.9);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.menu-overlay.is-active .menu-card {
  transform: scale(1);
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.menu-logo-small {
  height: 28px;
  width: auto;
}

.close-x {
  background: none;
  border: none;
  font-size: 1.6rem;
  color: #b57b52;
  cursor: pointer;
  line-height: 1;
  padding: 4px;
  transition: opacity 0.2s ease;
}

.close-x:hover {
  opacity: 0.7;
}

.menu-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.menu-item {
  text-decoration: none;
  color: #1c2a32;
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 1px;
  transition: color 0.2s ease;
}

.menu-item:hover {
  color: #b57b52;
}

.menu-item.router-link-active {
  color: #b57b52;
}

.menu-footer {
  text-align: center;
  margin-top: 32px;
  font-size: 0.75rem;
  color: #bbb;
}

/* Tablet and up */
@media (min-width: 480px) {
  .menu-card {
    width: auto;
    min-width: 350px;
    border-radius: 30px;
    padding: 30px;
  }

  .menu-logo-small {
    height: 30px;
  }

  .close-x {
    font-size: 1.8rem;
  }

  .menu-item {
    font-size: 1.3rem;
  }

  .menu-body {
    gap: 25px;
  }

  .menu-footer {
    margin-top: 40px;
    font-size: 0.8rem;
  }
}
</style>