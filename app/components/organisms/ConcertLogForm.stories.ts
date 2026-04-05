import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import ConcertLogForm from "./ConcertLogForm.vue";

const meta: Meta<typeof ConcertLogForm> = {
  title: "Organisms/ConcertLogForm",
  component: ConcertLogForm,
};

export default meta;
type Story = StoryObj<typeof ConcertLogForm>;

export const Default: Story = {
  args: { submitLabel: "記録する" },
};
