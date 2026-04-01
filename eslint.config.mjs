// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";
import vitest from "@vitest/eslint-plugin";

// @ts-check
import prettierConfig from "eslint-config-prettier";
import withNuxt from "./.nuxt/eslint.config.mjs";

/** Markdown ファイルを ESLint で扱うための最小パーサー */
const markdownParser = {
  parseForESLint(code) {
    const lines = code.split(/\r\n?|\n/g);
    return {
      ast: {
        type: "Program",
        start: 0,
        end: code.length,
        loc: {
          start: { line: 1, column: 0 },
          end: { line: lines.length, column: lines[lines.length - 1].length },
        },
        range: [0, code.length],
        body: [],
        comments: [],
        tokens: [],
      },
      scopeManager: null,
      visitorKeys: { Program: [] },
    };
  },
};

/**
 * MD040: コードブロックに言語タグがない場合に警告する ESLint ルール
 * eslint-plugin-markdownlint は ESLint 10 非互換のためインラインで実装
 */
const md040Rule = {
  meta: {
    type: "suggestion",
    messages: {
      noLang: "コードブロックに言語タグを指定してください (MD040)",
    },
  },
  create(context) {
    return {
      Program() {
        const src = context.sourceCode.getText();
        const lines = src.split(/\r\n?|\n/g);
        let inBlock = false;
        lines.forEach((line, i) => {
          if (!inBlock && /^```\s*$/.test(line)) {
            inBlock = true;
            context.report({
              loc: { line: i + 1, column: 0 },
              messageId: "noLang",
            });
          } else if (!inBlock && /^```\S/.test(line)) {
            inBlock = true;
          } else if (inBlock && /^```\s*$/.test(line)) {
            inBlock = false;
          }
        });
      },
    };
  },
};

export default withNuxt(
  prettierConfig,
  ...storybook.configs["flat/recommended"],
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
      curly: ["error", "all"],
    },
  },
  {
    files: ["app/**/*.ts", "backend/src/**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/strict-boolean-expressions": [
        "error",
        {
          allowString: false,
          allowNumber: false,
          allowNullableObject: false,
          allowNullableBoolean: false,
          allowNullableString: false,
          allowNullableNumber: false,
          allowNullableEnum: false,
        },
      ],
      "@typescript-eslint/no-unnecessary-boolean-literal-compare": "error",
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
  },
  {
    files: ["app/pages/**/*.vue"],
    rules: {
      "vue/multi-word-component-names": "off",
    },
  },
  // Nuxt 3 / vitest globals が自動インポートするものの明示的インポートを禁止
  {
    files: ["app/**/*.{ts,tsx,vue}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "vue",
              importNames: [
                "ref",
                "shallowRef",
                "isRef",
                "toRef",
                "toRefs",
                "unref",
                "reactive",
                "shallowReactive",
                "computed",
                "watch",
                "watchEffect",
                "onMounted",
                "onUnmounted",
                "onBeforeMount",
                "onBeforeUnmount",
                "onUpdated",
                "onBeforeUpdate",
                "nextTick",
              ],
              message: "Nuxt 3 が自動インポートします。明示的なインポートは不要です。",
            },
            {
              name: "vitest",
              importNames: [
                "vi",
                "describe",
                "it",
                "test",
                "expect",
                "beforeAll",
                "afterAll",
                "beforeEach",
                "afterEach",
              ],
              message: "vitest globals が有効です（globals: true）。明示的なインポートは不要です。",
            },
          ],
        },
      ],
    },
  },
  // テストで toBeTruthy / toBeFalsy の使用を禁止（明示的なマッチャーを使うこと）
  {
    files: ["**/*.test.ts", "**/*.spec.ts"],
    plugins: { vitest },
    rules: {
      "vitest/no-restricted-matchers": [
        "error",
        {
          toBeTruthy: "toBeDefined() など明示的なマッチャーを使用してください。",
          toBeFalsy: "toBeUndefined() など明示的なマッチャーを使用してください。",
        },
      ],
    },
  },
  // Markdown: コードブロックに言語タグがない場合に警告 (MD040)
  {
    files: ["**/*.md"],
    plugins: {
      local: { rules: { md040: md040Rule } },
    },
    languageOptions: {
      parser: markdownParser,
    },
    rules: {
      // Markdown ファイルには JS 向けルールを適用しない
      "no-irregular-whitespace": "off",
      "local/md040": "error",
    },
  }
);
