import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import type { Piece } from "~/types";
import PieceItem from "./PieceItem.vue";

const meta: Meta<typeof PieceItem> = {
  title: "Molecules/PieceItem",
  component: PieceItem,
};

export default meta;
type Story = StoryObj<typeof PieceItem>;

const samplePiece: Piece = {
  id: "1",
  title: "交響曲第9番 ニ短調 Op.125",
  composer: "ベートーヴェン",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

export const Default: Story = {
  args: { piece: samplePiece },
};

export const ShortTitle: Story = {
  args: {
    piece: {
      ...samplePiece,
      id: "2",
      title: "魔笛",
      composer: "モーツァルト",
    },
  },
};
