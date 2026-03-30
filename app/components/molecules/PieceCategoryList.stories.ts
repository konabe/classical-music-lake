import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import PieceCategoryList from "./PieceCategoryList.vue";

const meta: Meta<typeof PieceCategoryList> = {
  title: "Molecules/PieceCategoryList",
  component: PieceCategoryList,
};

export default meta;
type Story = StoryObj<typeof PieceCategoryList>;

export const AllCategories: Story = {
  args: {
    piece: {
      genre: "交響曲",
      era: "ロマン派",
      formation: "管弦楽",
      region: "ドイツ・オーストリア",
    },
  },
};

export const PartialCategories: Story = {
  args: {
    piece: {
      genre: "協奏曲",
      era: "バロック",
    },
  },
};

export const NoCategories: Story = {
  args: {
    piece: {},
  },
};
