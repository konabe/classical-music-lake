import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import type { Piece } from "~/types";
import PieceItem from "./PieceItem.vue";

const meta: Meta<typeof PieceItem> = {
  title: "Molecules/PieceItem",
  component: PieceItem,
};

export default meta;
type Story = StoryObj<typeof PieceItem>;

const COMPOSER_ID_BEETHOVEN = "00000000-0000-4000-8000-000000000001";
const COMPOSER_ID_MOZART = "00000000-0000-4000-8000-000000000002";

const samplePiece: Piece = {
  id: "1",
  title: "交響曲第9番 ニ短調 Op.125",
  composerId: COMPOSER_ID_BEETHOVEN,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

export const Default: Story = {
  args: { piece: samplePiece, composerName: "ベートーヴェン" },
};

export const ShortTitle: Story = {
  args: {
    piece: { ...samplePiece, id: "2", title: "魔笛", composerId: COMPOSER_ID_MOZART },
    composerName: "モーツァルト",
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
    composerName: "ベートーヴェン",
  },
};

export const WithPartialCategories: Story = {
  args: {
    piece: { ...samplePiece, genre: "交響曲", era: "ロマン派" },
    composerName: "ベートーヴェン",
  },
};

export const WithYouTubeThumbnail: Story = {
  args: {
    piece: { ...samplePiece, videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    composerName: "ベートーヴェン",
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
    composerName: "ベートーヴェン",
  },
};
