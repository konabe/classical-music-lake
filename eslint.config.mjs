// @ts-check
import prettierConfig from "eslint-config-prettier";
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(prettierConfig, {
  rules: {
    "@typescript-eslint/no-explicit-any": "error",
    "vue/component-name-in-template-casing": ["error", "PascalCase"],
  },
});
