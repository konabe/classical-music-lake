// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-01-01",
  ssr: false,
  devtools: { enabled: true },
  // NOTE: 3000だとなぜか起動できない
  devServer: {
    port: 3010,
  },
  modules: ["@nuxt/eslint", "@nuxtjs/storybook"],
  components: [{ path: "~/components", pathPrefix: false }],
  typescript: {
    strict: true,
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: "", // NUXT_PUBLIC_API_BASE_URL 環境変数で上書き可能
      cognitoDomain: "", // NUXT_PUBLIC_COGNITO_DOMAIN 環境変数で上書き可能
      cognitoClientId: "", // NUXT_PUBLIC_COGNITO_CLIENT_ID 環境変数で上書き可能
    },
  },
  test: {
    globals: true,
    environment: "happy-dom",
  },
});
