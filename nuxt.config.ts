import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  imports: {
    autoImport: false
  },
  pages: true,
  runtimeConfig: {
    mongoUri: 'mongodb://localhost:27017/nu31space',
    public: {
      baseUrl: '',
      gitCommitSha: '',
    },
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  css: ['~/assets/css/main.css'],
})
