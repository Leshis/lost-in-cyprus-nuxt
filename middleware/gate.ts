// middleware/gate.ts
export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()

  if (user.value) return

  const client = useSupabaseClient()
  const { data } = await client.auth.getSession()

  if (!data.session) return navigateTo('/login')
})