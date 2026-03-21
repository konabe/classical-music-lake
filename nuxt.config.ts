// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-01-01",
  ssr: false,
  devtools: { enabled: true },
  modules: ["@nuxt/eslint", "@nuxtjs/storybook"],
  css: ["~/assets/css/global.css"],
  typescript: {
    strict: true,
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: "", // NUXT_PUBLIC_API_BASE_URL 環境変数で上書き可能
    },
  },
  test: {
    globals: true,
    environment: "happy-dom",
  },
});
