// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2026-05-06',
  devtools: { enabled: true },
  ssr: false,
  modules: [
    ['@nuxtjs/supabase', {
      types: null,
      redirect: false
      // redirectOptions: {
      //   login: '/login',
      //   callback: '/confirm',
      //   include: ['/gate', '/gate/preview/*'],
      // },
    }],
    '@pinia/nuxt',
  ],
  css: ['~/assets/main.css'],
  runtimeConfig: {
    // public: {
    //   supabaseUrl: process.env.SUPABASE_URL,
    //   emailjsServiceId: process.env.NUXT_PUBLIC_EMAILJS_SERVICE_ID,
    //   emailjsTemplateId: process.env.NUXT_PUBLIC_EMAILJS_TEMPLATE_ID,
    //   emailjsPublicKey: process.env.NUXT_PUBLIC_EMAILJS_PUBLIC_KEY,
    //   // If using the official Nuxt Turnstile module, it usually expects this structure:
    //   turnstile: {
    //     siteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY,
    //   },
    // },
    public: {
    supabaseUrl: process.env.SUPABASE_URL,
    emailjsServiceId: '', // Checks NUXT_PUBLIC_EMAILJS_SERVICE_ID
    emailjsTemplateId: '', // Checks NUXT_PUBLIC_EMAILJS_TEMPLATE_ID
    emailjsPublicKey: '', // Checks NUXT_PUBLIC_EMAILJS_PUBLIC_KEY
    turnstile: {
      siteKey: '', // Checks NUXT_PUBLIC_TURNSTILE_SITE_KEY
    },
  },
  },
  app: {
    baseURL: '/',
    head: {
      htmlAttrs: { lang: 'en' },
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap',
        },
        { rel: 'icon', href: '/lost-in-cyprus.webp' },
      ],
    },
  },
  experimental: {
    viteEnvironmentApi: true
  }
})
