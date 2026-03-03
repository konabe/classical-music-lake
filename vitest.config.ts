import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
  test: {
    environment: "nuxt",
    environmentOptions: {
      nuxt: {
        domEnvironment: "happy-dom",
      },
    },
    coverage: {
      provider: "v8",
      include: ["composables/**/*.ts", "components/**/*.vue", "types/**/*.ts"],
      exclude: ["node_modules", ".nuxt"],
    },
  },
});
