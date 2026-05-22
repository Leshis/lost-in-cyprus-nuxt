export default defineNuxtRouteMiddleware(async (to) => {
  // Skip auth check on server — Supabase session isn't available via SSR here.
  // The middleware will re-run client-side after hydration.
  if (import.meta.server) return  // ← add this

  const user = useSupabaseUser()
  if (user.value) return

  if (import.meta.client) {
    const client = useSupabaseClient()
    try {
      const { data, error } = await client.auth.getUser()
      if (!error && data?.user) return
    } catch (err) {
      console.error('Gate Middleware Auth Error:', err)
    }
  }

  return navigateTo(`/login?redirectTo=${encodeURIComponent(to.fullPath)}`)
})