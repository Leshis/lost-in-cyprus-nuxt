<template>
  <div class="error-page">
    <div class="error-container">
      <div class="compass">
        <span class="compass-icon">🧭</span>
      </div>

      <h1 class="error-code">404</h1>
      <h2 class="error-title">Lost in Cyprus</h2>
      <p class="error-message">
        Even the best explorers lose their way sometimes. This secret doesn't exist — or hasn't been uncovered yet.
      </p>

      <div class="error-actions">
        <button class="btn-primary" @click="handleError">
          Back to the Map
        </button>
      </div>
    </div>

    <div class="bg-blob blob-1" />
    <div class="bg-blob blob-2" />
  </div>
</template>

<script setup lang="ts">
import { clearError } from '#app'

const handleError = () => clearError({ redirect: '/' })
</script>

<style scoped>
.error-page {
  min-height: 100svh;
  background-color: #f8f6f0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  overflow: hidden;
  font-family: inherit;
}

.error-container {
  text-align: center;
  max-width: 480px;
  position: relative;
  z-index: 1;
}

/* ─── Compass ───────────────────────────────────────────────────────────── */
.compass {
  margin-bottom: 16px;
  animation: spin 8s linear infinite;
  display: inline-block;
}

.compass-icon {
  font-size: 3rem;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* ─── Text ──────────────────────────────────────────────────────────────── */
.error-code {
  font-size: clamp(5rem, 20vw, 8rem);
  font-weight: 700;
  color: #c69f4b;
  margin: 0;
  line-height: 1;
  letter-spacing: -0.04em;
}

.error-title {
  font-size: clamp(1.5rem, 5vw, 2rem);
  font-weight: 700;
  color: #1c2a32;
  margin: 8px 0 16px;
  letter-spacing: -0.02em;
}

.error-message {
  color: #666;
  font-size: 1rem;
  line-height: 1.6;
  margin: 0 0 32px;
}

/* ─── Actions ───────────────────────────────────────────────────────────── */
.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary {
  background: #c69f4b;
  color: white;
  border: none;
  padding: 12px 28px;
  border-radius: 24px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  text-decoration: none;
}

.btn-primary:hover {
  background: #b08a38;
  transform: translateY(-1px);
}

.btn-secondary {
  background: white;
  color: #1c2a32;
  border: 1px solid #e0e0e0;
  padding: 12px 28px;
  border-radius: 24px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  text-decoration: none;
  display: inline-block;
}

.btn-secondary:hover {
  background: rgba(0,0,0,0.04);
  transform: translateY(-1px);
}

/* ─── Background blobs ──────────────────────────────────────────────────── */
.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.25;
  pointer-events: none;
}

.blob-1 {
  width: 400px;
  height: 400px;
  background: #c69f4b;
  top: -100px;
  right: -100px;
}

.blob-2 {
  width: 300px;
  height: 300px;
  background: #1c2a32;
  bottom: -80px;
  left: -80px;
}
</style>