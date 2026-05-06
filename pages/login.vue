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
import { useRouter } from 'vue-router'
import type { AuthError } from '@supabase/supabase-js'

const supabase = useSupabaseClient()
const router = useRouter()
const email = ref<string>('')
const password = ref<string>('')
const loading = ref<boolean>(false)
const errorMsg = ref<string>('')

const handleLogin = async (): Promise<void> => {
  try {
    loading.value = true
    errorMsg.value = ''

    const { error } = await supabase.auth.signInWithPassword({
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
  max-width: 400px;
  text-align: center;
  border: 1px solid #eee;
}

.brand-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1c2a32;
  margin-bottom: 0.25rem;
}

.subtitle {
  font-size: 0.85rem;
  color: #718096;
  margin-bottom: 1.5rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: left;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.input-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #2c3e50;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.input-group input {
  padding: 0.75rem;
  border: 2px solid #edf2f7;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.input-group input:focus {
  outline: none;
  border-color: #b57b52;
}

.login-btn {
  margin-top: 0.5rem;
  padding: 0.875rem;
  background: #b57b52;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.login-btn:hover:not(:disabled) {
  background: #a06a45;
}

.login-btn:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
}

.error-text {
  font-size: 0.875rem;
  color: #c62828;
  text-align: center;
}
</style>