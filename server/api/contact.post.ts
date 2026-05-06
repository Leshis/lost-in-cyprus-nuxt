// server/api/contact.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, email, message, turnstileToken } = body

  // Validate Turnstile server-side
  const verification = await $fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: {
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: turnstileToken,
    },
  })

  if (!verification.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid Turnstile token' })
  }

  // Your EmailJS call moves here or you switch to a direct SMTP call
  // For now, return success and keep EmailJS on the client
  return { ok: true }
})