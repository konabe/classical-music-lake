import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import CategoryBadge from "./CategoryBadge.vue";

const meta: Meta<typeof CategoryBadge> = {
  title: "Atoms/CategoryBadge",
  component: CategoryBadge,
};

export default meta;
type Story = StoryObj<typeof CategoryBadge>;

export const Default: Story = {
  args: { label: "ジャンル", value: "交響曲" },
};

export const Era: Story = {
  args: { label: "時代", value: "ロマン派" },
};

export const Formation: Story = {
  args: { label: "編成", value: "管弦楽" },
};

export const Region: Story = {
  args: { label: "地域", value: "ドイツ・オーストリア" },
};
