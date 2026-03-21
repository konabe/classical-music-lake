import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import RequiredMark from "./RequiredMark.vue";

const meta: Meta<typeof RequiredMark> = {
  title: "Atoms/RequiredMark",
  component: RequiredMark,
};

export default meta;
type Story = StoryObj<typeof RequiredMark>;

export const Default: Story = {};
