// middleware/gate.ts
export default defineNuxtRouteMiddleware(() => {
  const user = useSupabaseUser()

  if (!user.value) {
    return navigateTo('/login')
  }

  // Your two admin emails — same check as before
  const admins = ['you@email.com', 'other@email.com']
  if (!admins.includes(user.value.email ?? '')) {
    return navigateTo('/')
  }
})