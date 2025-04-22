// nuxt.config.ts
export default defineNuxtConfig({
  css: ['~/assets/css/main.css'],
  devtools: { enabled: true },
  nitro: {
    experimental: {
      tasks: true
    }
  },

  modules: [
    '@nuxt/ui',
    '@nuxthub/core',
    '@pinia/nuxt',
    '@pinia/colada-nuxt',
    '@vueuse/nuxt',
  ],

  typescript: {
    strict: true
  },

  hub: {
    database: true,
    blob: true
  },

  ui: {
    colorMode: false
  },

  // Add default page transition
  app: {
    pageTransition: { 
      name: 'slide-right', 
      mode: 'out-in' 
    }
  },

  compatibilityDate: '2025-03-25'
})
