import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import RatingSelector from "@/components/molecules/RatingSelector.vue";

const meta: Meta<typeof RatingSelector> = {
  title: "Molecules/RatingSelector",
  component: RatingSelector,
};

export default meta;
type Story = StoryObj<typeof RatingSelector>;

export const Default: Story = {
  args: { modelValue: 3 },
};

export const FullRating: Story = {
  args: { modelValue: 5 },
};

export const MinRating: Story = {
  args: { modelValue: 1 },
};
