import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import PieceNewTemplate from "./PieceNewTemplate.vue";

const meta: Meta<typeof PieceNewTemplate> = {
  title: "Templates/PieceNewTemplate",
  component: PieceNewTemplate,
};

export default meta;
type Story = StoryObj<typeof PieceNewTemplate>;

export const Default: Story = {
  args: {
    error: null,
  },
};

export const WithError: Story = {
  args: {
    error: "楽曲の登録に失敗しました。時間をおいて再度お試しください。",
  },
};
