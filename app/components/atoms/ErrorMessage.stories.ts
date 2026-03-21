import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import ErrorMessage from "./ErrorMessage.vue";

const meta: Meta<typeof ErrorMessage> = {
  title: "Atoms/ErrorMessage",
  component: ErrorMessage,
};

export default meta;
type Story = StoryObj<typeof ErrorMessage>;

export const Inline: Story = {
  args: { message: "メールアドレスの形式が正しくありません" },
};

export const Block: Story = {
  args: { message: "保存に失敗しました。時間をおいて再度お試しください。", variant: "block" },
};

export const Centered: Story = {
  args: { message: "メールアドレスまたはパスワードが正しくありません", center: true },
};
