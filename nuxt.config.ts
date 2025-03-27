// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
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

  css: ['~/assets/css/main.css'],

  typescript: {
    strict: true
  },

  hub: {
    database: true
  },

  compatibilityDate: '2025-03-25'
})