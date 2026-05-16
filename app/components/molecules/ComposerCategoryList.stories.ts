import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import ComposerCategoryList from "@/components/molecules/ComposerCategoryList.vue";

const meta: Meta<typeof ComposerCategoryList> = {
  title: "Molecules/ComposerCategoryList",
  component: ComposerCategoryList,
};

export default meta;
type Story = StoryObj<typeof ComposerCategoryList>;

export const AllCategories: Story = {
  args: {
    composer: {
      era: "ロマン派",
      region: "ドイツ・オーストリア",
    },
  },
};

export const PartialCategories: Story = {
  args: {
    composer: {
      era: "バロック",
    },
  },
};

export const NoCategories: Story = {
  args: {
    composer: {},
  },
};
