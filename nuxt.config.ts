import tailwindcss from '@tailwindcss/vite'

const IMMUTABLE = { 'cache-control': 'public, max-age=31536000, immutable' }

export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: false },
  telemetry: false,
  typescript: { strict: true },

  modules: ['@nuxt/content', '@nuxt/image', '@nuxt/fonts', '@nuxtjs/i18n', '@nuxt/eslint'],

  // Composants auto-importés par leur nom de fichier, sans préfixe de dossier (<Logo />, <HomeOpening />…)
  components: [{ path: '~/components', pathPrefix: false }],

  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
    // Évite les rechargements de page en dev (dépendances chargées dynamiquement)
    optimizeDeps: { include: ['gsap', 'gsap/ScrollTrigger', 'matter-js'] },
  },

  // SQLite natif de Node (pas de module natif à compiler dans Docker)
  content: { experimental: { sqliteConnector: 'native' } },

  image: {
    quality: 78,
    format: ['avif', 'webp'],
    screens: { xs: 360, sm: 640, md: 768, lg: 1024, xl: 1280, xxl: 1536 },
  },

  // Polices auto-hébergées dans public/fonts : aucun fournisseur distant.
  fonts: {
    providers: { google: false, googleicons: false, bunny: false, fontshare: false, fontsource: false, adobe: false },
  },

  i18n: {
    defaultLocale: 'fr',
    strategy: 'prefix_except_default',
    locales: [
      { code: 'fr', language: 'fr-FR', name: 'Français' },
      { code: 'en', language: 'en-GB', name: 'English' },
    ],
    detectBrowserLanguage: false,
    compilation: { strictMessage: false },
  },

  runtimeConfig: {
    contactTo: '',
    contactFrom: '',
    smtp: { host: '', port: 587, secure: false, user: '', pass: '' },
    public: {
      siteUrl: 'http://localhost:3000',
      showPlaceholders: false,
    },
  },

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      htmlAttrs: { lang: 'fr' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#2C3691' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        {
          rel: 'preload',
          as: 'font',
          type: 'font/woff2',
          href: '/fonts/bagel-fat-one-latin.woff2',
          crossorigin: 'anonymous',
        },
        {
          rel: 'preload',
          as: 'font',
          type: 'font/woff2',
          href: '/fonts/dm-sans-latin.woff2',
          crossorigin: 'anonymous',
        },
      ],
    },
  },

  nitro: {
    preset: 'node-server',
    compressPublicAssets: true,
    routeRules: {
      '/fonts/**': { headers: IMMUTABLE },
      '/_nuxt/**': { headers: IMMUTABLE },
    },
  },
})
