export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return

  const user = useSupabaseUser()
  if (user.value) return

  const client = useSupabaseClient()
  const { data, error } = await client.auth.getUser()

  if (error || !data.user) return navigateTo('/login')
})
