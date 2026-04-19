import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import FeaturedPiece from "./FeaturedPiece.vue";
import type { Piece } from "~/types";

const makePiece = (overrides: Partial<Piece> = {}): Piece => {
  return {
    id: "piece-1",
    title: "ピアノ協奏曲第1番 変ロ短調 Op.23",
    composer: "チャイコフスキー",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    ...overrides,
  };
};

const meta: Meta<typeof FeaturedPiece> = {
  title: "Organisms/FeaturedPiece",
  component: FeaturedPiece,
};

export default meta;
type Story = StoryObj<typeof FeaturedPiece>;

export const Default: Story = {
  args: {
    pieces: [
      makePiece({ id: "1" }),
      makePiece({
        id: "2",
        title: "交響曲第5番 ハ短調 Op.67",
        composer: "ベートーヴェン",
      }),
      makePiece({
        id: "3",
        title: "バイオリン協奏曲 ニ長調 Op.77",
        composer: "ブラームス",
      }),
    ],
    loading: false,
  },
};

export const Loading: Story = {
  args: {
    pieces: [],
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    pieces: [],
    loading: false,
  },
};

export const SinglePiece: Story = {
  args: {
    pieces: [makePiece()],
    loading: false,
  },
};
