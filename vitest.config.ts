import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
  test: {
    environment: "nuxt",
    globals: true,
    environmentOptions: {
      nuxt: {
        domEnvironment: "happy-dom",
      },
    },
    pool: "threads",
    exclude: ["**/node_modules/**", "tests/e2e/**", "backend/**"],
    coverage: {
      provider: "v8",
      include: ["app/composables/**/*.ts", "app/components/**/*.vue", "app/types/**/*.ts"],
      exclude: ["node_modules", ".nuxt"],
    },
  },
});
