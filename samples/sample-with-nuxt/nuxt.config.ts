// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      // Overridden by NUXT_PUBLIC_CLIENT_ID / NUXT_PUBLIC_AUTHORITY
      clientId: '',
      authority: '',
      redirectUri: 'http://localhost:3000',
      postLogoutRedirectUri: 'http://localhost:3000',
    },
  },
  css: ['~/assets/css/main.css'],
})
