// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  ssr: false,
  devtools: { enabled: true },
  typescript: {
    strict: true,
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: '', // NUXT_PUBLIC_API_BASE_URL 環境変数で上書き可能
    },
  },
})
