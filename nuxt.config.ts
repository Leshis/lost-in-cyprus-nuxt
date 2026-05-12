// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2026-05-06',
  devtools: { enabled: true },
  ssr: true,
  modules: [
    '@netlify/nuxt',
    'nuxt-security',
    ['@nuxtjs/supabase', {
      types: null,
      redirect: false
    }],
    '@pinia/nuxt',
    '@vite-pwa/nuxt',
    'nuxt-schema-org'
  ],
  security: {
    headers: {
      contentSecurityPolicy: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'nonce-{{nonce}}'", "https://challenges.cloudflare.com"],
        'style-src': ["'self'", "'nonce-{{nonce}}'", "https://fonts.googleapis.com"],
        'font-src': ["'self'", "https://fonts.gstatic.com"],
        'img-src': ["'self'", "data:", "blob:", "https://*.supabase.co", "https://placehold.jp"],
        'connect-src': ["'self'", "https://*.supabase.co", "https://api.emailjs.com"],
        'frame-src': ["https://challenges.cloudflare.com"],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
      },
      xFrameOptions: 'SAMEORIGIN',
      xContentTypeOptions: 'nosniff',
      referrerPolicy: 'strict-origin-when-cross-origin',
      permissionsPolicy: {
        camera: [],
        microphone: [],
        geolocation: [],
      },
    },
  },
  site: {
    url: 'https://lostincyprus.netlify.app',
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
      title: 'Lost in Cyprus',
      meta: [
        { name: 'theme-color', content: '#ffffff' }, // Fixes "Does not set a theme color"
        { name: 'description', content: 'Discover hidden gems and authentic experiences in Cyprus' },
        { property: 'og:title', content: 'Lost in Cyprus' },
        { property: 'og:description', content: 'Discover hidden gems and authentic experiences in Cyprus' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://lostincyprus.netlify.app' },
        { property: 'og:site_name', content: 'Lost in Cyprus' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Lost in Cyprus' },
        { name: 'twitter:description', content: 'Discover hidden gems and authentic experiences in Cyprus' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap',
        },
        { rel: 'icon', href: '/lost-in-cyprus.webp' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }, // Fixes "apple-touch-icon" error
        { rel: 'canonical', href: 'https://lostincyprus.netlify.app' }
      ],
    },
  },
  experimental: {
    viteEnvironmentApi: true
  }
})