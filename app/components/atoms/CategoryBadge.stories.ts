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

export const Genre: Story = {
  args: { kind: "genre", label: "ジャンル", value: "交響曲" },
};

export const Era: Story = {
  args: { kind: "era", label: "時代", value: "ロマン派" },
};

export const Formation: Story = {
  args: { kind: "formation", label: "編成", value: "管弦楽" },
};

export const Region: Story = {
  args: { kind: "region", label: "地域", value: "ドイツ・オーストリア" },
};
