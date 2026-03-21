import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import HomeTemplate from "./HomeTemplate.vue";

const meta: Meta<typeof HomeTemplate> = {
  title: "Templates/HomeTemplate",
  component: HomeTemplate,
};

export default meta;
type Story = StoryObj<typeof HomeTemplate>;

export const Default: Story = {};
