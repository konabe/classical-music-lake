import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import ConcertLogNewTemplate from "./ConcertLogNewTemplate.vue";

const meta: Meta<typeof ConcertLogNewTemplate> = {
  title: "Templates/ConcertLogNewTemplate",
  component: ConcertLogNewTemplate,
};

export default meta;
type Story = StoryObj<typeof ConcertLogNewTemplate>;

export const Default: Story = {
  args: { error: null },
};

export const WithError: Story = {
  args: { error: "記録の作成に失敗しました。" },
};
