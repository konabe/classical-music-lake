import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import ComposerNewTemplate from "./ComposerNewTemplate.vue";

const meta: Meta<typeof ComposerNewTemplate> = {
  title: "Templates/ComposerNewTemplate",
  component: ComposerNewTemplate,
};

export default meta;
type Story = StoryObj<typeof ComposerNewTemplate>;

export const Default: Story = {
  args: { errorMessage: "" },
};

export const WithError: Story = {
  args: { errorMessage: "登録に失敗しました。入力内容を確認してください。" },
};
