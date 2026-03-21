import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import FavoriteIndicator from "./FavoriteIndicator.vue";

const meta: Meta<typeof FavoriteIndicator> = {
  title: "Molecules/FavoriteIndicator",
  component: FavoriteIndicator,
};

export default meta;
type Story = StoryObj<typeof FavoriteIndicator>;

export const Favorite: Story = {
  args: { isFavorite: true },
};

export const NotFavorite: Story = {
  args: { isFavorite: false },
};
