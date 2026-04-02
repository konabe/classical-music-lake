import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
  test: {
    globals: true,
    environment: "nuxt",
    setupFiles: ["./vitest.setup.ts"],
    environmentOptions: {
      nuxt: {
        domEnvironment: "happy-dom",
      },
    },
    exclude: ["**/node_modules/**", "tests/e2e/**", "backend/**"],
    coverage: {
      provider: "v8",
      include: ["app/composables/**/*.ts", "app/components/**/*.vue", "app/types/**/*.ts"],
      exclude: ["node_modules", ".nuxt"],
    },
  },
});
