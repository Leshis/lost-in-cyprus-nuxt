export default defineNuxtRouteMiddleware(async (to) => {
  console.log('[gate] middleware fired', { 
    path: to.fullPath, 
    isServer: import.meta.server, 
    isClient: import.meta.client 
  })

  if (import.meta.server) {
    console.log('[gate] server side - skipping')
    return
  }

  const user = useSupabaseUser()
  console.log('[gate] user.value:', user.value)

  if (user.value) {
    console.log('[gate] user found reactively - allowing')
    return
  }

  if (import.meta.client) {
    const client = useSupabaseClient()
    try {
      const { data, error } = await client.auth.getUser()
      console.log('[gate] getUser result:', { data, error })
      if (!error && data?.user) {
        console.log('[gate] session verified - allowing')
        return
      }
    } catch (err) {
      console.error('[gate] auth error:', err)
    }
  }

  console.log('[gate] no auth found - redirecting to login')
  return navigateTo(`/login?redirectTo=${encodeURIComponent(to.fullPath)}`)
})