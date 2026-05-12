// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2026-05-06',
  devtools: { enabled: true },
  ssr: false,
  modules: [
    ['@nuxtjs/supabase', {
      types: null,
      redirect: false
    }],
    '@pinia/nuxt',
    '@vite-pwa/nuxt',
    'nuxt-schema-org'
  ],
  site: {
    url: 'lostincyprus.netlify.app',
    name: 'Lost in Cyprus'
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Lost in Cyprus',
      short_name: 'Lost in Cyprus',
      description: 'Discover hidden gems and authentic experiences in Cyprus',
      theme_color: '#ffffff',
      background_color: '#ffffff',
      display: 'standalone',
      icons: [
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    },
    workbox: {
      navigateFallback: '/'
    },
    devOptions: {
      enabled: true,
      type: 'module'
    }
  },
  css: ['~/assets/main.css'],
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      emailjsServiceId: '',
      emailjsTemplateId: '',
      emailjsPublicKey: '',
      turnstile: {
        siteKey: '',
      },
    },
  },
  app: {
    baseURL: '/',
    head: {
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'theme-color', content: '#ffffff' } // Fixes "Does not set a theme color"
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap',
        },
        { rel: 'icon', href: '/lost-in-cyprus.webp' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' } // Fixes "apple-touch-icon" error
      ],
    },
  },
  experimental: {
    viteEnvironmentApi: true
  }
})