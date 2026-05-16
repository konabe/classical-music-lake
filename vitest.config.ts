import path from "node:path";
import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  test: {
    globals: true,
    environment: "nuxt",
    setupFiles: ["./vitest.setup.ts"],
    environmentOptions: {
      nuxt: {
        domEnvironment: "happy-dom",
      },
    },
    exclude: ["**/node_modules/**", "tests/e2e/**", "backend/**", "cdk/**", ".claude/**"],
    coverage: {
      provider: "v8",
      include: ["app/**/*.{ts,vue}", "shared/**/*.ts"],
      exclude: [
        "node_modules",
        ".nuxt",
        "**/*.{test,spec}.{ts,js}",
        "**/*.stories.{ts,js}",
        "**/*.d.ts",
        "app/**/index.ts",
      ],
      reporter: ["text", "lcov"],
      reportsDirectory: "./coverage",
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
});
