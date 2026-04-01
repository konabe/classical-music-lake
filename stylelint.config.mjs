/** @type {import('stylelint').Config} */
export default {
  extends: ["stylelint-config-recommended-vue"],
  rules: {
    "selector-pseudo-class-disallowed-list": ["deep"],
    "no-descending-specificity": null,
  },
};
