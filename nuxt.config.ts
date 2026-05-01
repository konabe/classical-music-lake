import { codecovVitePlugin } from "@codecov/vite-plugin";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-01-01",
  ssr: false,
  devtools: { enabled: true },
  // NOTE: 3000だとなぜか起動できない
  devServer: {
    port: 3010,
  },
  // NOTE: @nuxtjs/storybook@9.0.1 は storybook ~9.0.5 を peer に要求しているが、
  // 本プロジェクトは storybook@10.3.5 を使用しているため、組み込み proxy が壊れて
  // dev サーバーが /_nuxt/* を 500 で返す。upstream の修正待ちのため一旦外す。
  // Storybook 自体は `pnpm storybook` でスタンドアロン起動可能。詳細は #590 を参照。
  modules: ["@nuxt/eslint", "@nuxtjs/color-mode"],
  colorMode: {
    preference: "system",
    fallback: "light",
    classSuffix: "",
    storageKey: "nocturne-color-mode",
  },
  components: [{ path: "~/components", pathPrefix: false }],
  css: ["~/assets/css/theme.css"],
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
  vite: {
    plugins: [
      codecovVitePlugin({
        enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
        bundleName: "classical-music-lake",
        uploadToken: process.env.CODECOV_TOKEN,
      }),
    ],
  },
});
