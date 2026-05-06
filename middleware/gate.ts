// middleware/gate.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  
  // Give the client a moment to resolve the session 
  // if we are navigating client-side
  if (import.meta.client && !user.value) {
    const client = useSupabaseClient()
    const { data } = await client.auth.getSession()
    if (!data.session) return navigateTo('/login')
  }
  
  if (!user.value && import.meta.server) {
    return navigateTo('/login')
  }
})