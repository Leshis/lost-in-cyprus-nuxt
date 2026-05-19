export default defineNuxtRouteMiddleware(async (to) => {
  // 1. Get the reactive user tracking object from Nuxt-Supabase
  const user = useSupabaseUser()

  // 2. If Nuxt already has the active user cached reactively, allow entry
  if (user.value) return

  // 3. If running on the client and user isn't populated yet, double-check session integrity
  if (import.meta.client) {
    const client = useSupabaseClient()
    try {
      const { data, error } = await client.auth.getUser()
      if (!error && data?.user) {
        return // Session verified successfully, allow access
      }
    } catch (err) {
      console.error('Gate Middleware Auth Error:', err)
    }
  }

  // 4. If we are on the server and no cookie context could verify a user,
  // or if the client validation failed, safely redirect to login.
  // We use a clean redirect and specify the intended target so they can return to this preview after login.
  return navigateTo(`/login?redirectTo=${encodeURIComponent(to.fullPath)}`)
})
