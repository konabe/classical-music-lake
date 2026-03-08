// @ts-check
import prettierConfig from "eslint-config-prettier";
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(
  prettierConfig,
  {
    files: ["backend/src/test/vitest.d.ts"],
    rules: {
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "vue/component-name-in-template-casing": ["error", "PascalCase"],
    },
  },
  {
    files: ["**/*.{ts,tsx,vue}"],
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  }
);
