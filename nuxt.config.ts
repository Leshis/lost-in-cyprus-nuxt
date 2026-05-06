

// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/supabase',
    '@pinia/nuxt',
    '@nuxtjs/sitemap',
  ],

  css: ['~/assets/main.css'],

  supabase: {
    // Redirect unauthenticated users away from /gate
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      include: ['/gate', '/gate/*'],
    },
  },

  sitemap: {
    hostname: 'https://yourdomain.netlify.app', // update when live
    // Dynamic article routes are added automatically via Nuxt's route discovery
    // You'll add a custom source for Supabase slugs in Phase 7
    sources: ['/api/__sitemap__/urls'],
  },

  runtimeConfig: {
  turnstileSecretKey: '', // server-only, set in Netlify
  public: {
    emailjsServiceId: '',
    emailjsTemplateId: '',
    emailjsPublicKey: '',
    turnstileSiteKey: '',
  },
},

  app: {
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
      meta: [
        { name: 'referrer', content: 'no-referrer' },
      ],
    },
  },

  // Vite config passthrough
  vite: {
    plugins: [],
  },
  hooks: {
    async 'nitro:config'(nitroConfig) {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NUXT_PUBLIC_SUPABASE_URL!,
        process.env.NUXT_PUBLIC_SUPABASE_KEY!
      )
      const { data } = await supabase
        .from('articles')
        .select('slug')
        .eq('is_published', true)

      const slugRoutes = (data ?? []).map(({ slug }) => `/articles/${slug}`)
      nitroConfig.prerender = nitroConfig.prerender || {}
      nitroConfig.prerender.routes = [
        ...(nitroConfig.prerender.routes || []),
        ...slugRoutes,
      ]
    },
  }
})