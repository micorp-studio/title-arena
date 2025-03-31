// https://nuxt.com/docs/api/configuration/nuxt-config
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
    database: true
  },

  ui: {
    colorMode: false
  },

  compatibilityDate: '2025-03-25'
})