/** @type {import('stylelint').Config} */
export default {
  extends: ["stylelint-config-recommended", "stylelint-config-recommended-vue"],
  rules: {
    "no-descending-specificity": null,
  },
  overrides: [
    {
      files: ["**/*.vue"],
      rules: {
        "selector-pseudo-class-disallowed-list": ["deep"],
        "selector-pseudo-element-disallowed-list": ["v-deep"],
      },
    },
  ],
};
