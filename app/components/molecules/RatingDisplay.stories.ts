import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import RatingDisplay from "@/components/molecules/RatingDisplay.vue";

const meta: Meta<typeof RatingDisplay> = {
  title: "Molecules/RatingDisplay",
  component: RatingDisplay,
};

export default meta;
type Story = StoryObj<typeof RatingDisplay>;

export const FiveStar: Story = {
  args: { rating: 5 },
};

export const ThreeStar: Story = {
  args: { rating: 3 },
};

export const OneStar: Story = {
  args: { rating: 1 },
};

export const ZeroStar: Story = {
  args: { rating: 0 },
};
