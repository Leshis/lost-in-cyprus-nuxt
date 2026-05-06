// nuxt.config.ts
export default defineNuxtConfig({
  //compatibilityDate: '2026-05-06',
  devtools: { enabled: true },
  ssr: false,

  nitro: {
    preset: process.env.NODE_ENV === 'production' ? 'github-pages' : undefined,
  },

  modules: [
    ['@nuxtjs/supabase', {
      types: null,
      redirectOptions: {
        login: '/login',
        callback: '/confirm',
        include: ['/gate', '/gate/*'],
      },
    }],
    '@pinia/nuxt',
  ],

  css: ['~/assets/main.css'],

  runtimeConfig: {
    public: {
      emailjsServiceId: '',
      emailjsTemplateId: '',
      emailjsPublicKey: '',
      turnstileSiteKey: '',
    },
  },

  app: {
    baseURL: process.env.NODE_ENV === 'production' ? '/lost-in-cyprus-nuxt/' : '/',
    head: {
      htmlAttrs: { lang: 'en' },
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap',
        },
        { rel: 'icon', href: '/lost-in-cyprus.png' },
      ],
    },
  },
  experimental: {
    externalVue: false,
  }
})