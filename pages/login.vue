<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="brand-title">Lost In Cyprus</h2>
      <p class="subtitle">Secure Entry Gateway</p>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="input-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            placeholder="curator@lostincyprus.com"
            required
            autocomplete="email"
          />
        </div>

        <div class="input-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="••••••••"
            required
            autocomplete="current-password"
          />
        </div>

        <button type="submit" :disabled="loading" class="login-btn">
          {{ loading ? 'Verifying...' : 'Access Vault' }}
        </button>

        <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const user = useSupabaseUser()
import { useRouter } from 'vue-router'
import type { AuthError } from '@supabase/supabase-js'

const router = useRouter()
const email = ref<string>('')
const password = ref<string>('')
const loading = ref<boolean>(false)
const errorMsg = ref<string>('')

const handleLogin = async (): Promise<void> => {
  try {
    loading.value = true  // ← was loading.ref = true (bug)
    errorMsg.value = ''

    const { error } = await supabaseAdmin.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

    if (error) throw error

    router.push('/gate')
  } catch (err) {
    errorMsg.value = (err as AuthError).message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* ── Mobile first ─────────────────────── */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100dvh;
  padding: 16px;
  background-color: #fdfcf8;
  box-sizing: border-box;
}

.login-card {
  background: white;
  padding: 2rem 1.5rem;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(28, 42, 50, 0.05);
  width: 100%;
  text-align: center;
  border: 1px solid #eee;
}

.brand-title {
  color: #b57b52;
  font-family: Georgia, serif;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #1c2a32;
  font-size: 0.8rem;
  opacity: 0.7;
  margin-bottom: 2rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  text-align: left;
}

.input-group label {
  display: block;
  font-size: 0.85rem;
  color: #1c2a32;
  margin-bottom: 0.4rem;
  font-weight: 600;
}

.input-group input {
  width: 100%;
  padding: 0.85rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fafafa;
  font-size: 1rem; /* prevents iOS zoom on focus */
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.input-group input:focus {
  outline: none;
  border-color: #b57b52;
}

.login-btn {
  background-color: #1c2a32;
  color: white;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
  -webkit-tap-highlight-color: transparent;
}

.login-btn:hover {
  background-color: #b57b52;
}

.login-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-text {
  color: #d9534f;
  font-size: 0.85rem;
  text-align: center;
  margin: 0;
}

/* ── Desktop ───────────────────────────── */
@media (min-width: 480px) {
  .login-card {
    padding: 2.5rem;
    max-width: 420px;
  }

  .brand-title {
    font-size: 1.75rem;
  }
}
</style>