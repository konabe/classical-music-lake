import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import ListeningLogNewTemplate from "./ListeningLogNewTemplate.vue";

const meta: Meta<typeof ListeningLogNewTemplate> = {
  title: "Templates/ListeningLogNewTemplate",
  component: ListeningLogNewTemplate,
};

export default meta;
type Story = StoryObj<typeof ListeningLogNewTemplate>;

export const Default: Story = {
  args: {
    error: null,
  },
};

export const WithError: Story = {
  args: {
    error: "記録の保存に失敗しました。時間をおいて再度お試しください。",
  },
};
