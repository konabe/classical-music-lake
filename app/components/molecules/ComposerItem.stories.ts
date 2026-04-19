import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import ComposerItem from "./ComposerItem.vue";

const meta: Meta<typeof ComposerItem> = {
  title: "Molecules/ComposerItem",
  component: ComposerItem,
};

export default meta;
type Story = StoryObj<typeof ComposerItem>;

const baseComposer = {
  id: "1",
  name: "ベートーヴェン",
  createdAt: "2024-06-01T00:00:00.000Z",
  updatedAt: "2024-06-01T00:00:00.000Z",
};

export const Default: Story = {
  args: { composer: baseComposer },
};

export const WithCategories: Story = {
  args: {
    composer: {
      ...baseComposer,
      era: "古典派",
      region: "ドイツ・オーストリア",
    },
  },
};
