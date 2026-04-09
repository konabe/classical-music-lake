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

export const WithAllCategories: Story = {
  args: {
    piece: {
      ...samplePiece,
      genre: "交響曲",
      era: "ロマン派",
      formation: "管弦楽",
      region: "ドイツ・オーストリア",
    },
  },
};

export const WithPartialCategories: Story = {
  args: {
    piece: {
      ...samplePiece,
      genre: "交響曲",
      era: "ロマン派",
    },
  },
};

export const WithYouTubeThumbnail: Story = {
  args: {
    piece: {
      ...samplePiece,
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    },
  },
};

export const WithYouTubeThumbnailAndCategories: Story = {
  args: {
    piece: {
      ...samplePiece,
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      genre: "交響曲",
      era: "ロマン派",
      formation: "管弦楽",
      region: "ドイツ・オーストリア",
    },
  },
};
