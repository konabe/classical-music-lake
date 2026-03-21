import type { StorybookConfig } from "@storybook-vue/nuxt";

const config: StorybookConfig = {
  stories: [
    "../app/components/**/*.mdx",
    "../app/components/**/*.stories.@(js|jsx|ts|tsx|mdx)",
    "../app/layouts/**/*.stories.@(js|jsx|ts|tsx|mdx)",
  ],
  addons: ["@storybook/addon-a11y", "@storybook/addon-docs"],
  framework: "@storybook-vue/nuxt",
  viteFinal: async (config, { configType }) => {
    if (configType === "PRODUCTION") {
      config.base = "/storybook/";
    }
    return config;
  },
};
export default config;
