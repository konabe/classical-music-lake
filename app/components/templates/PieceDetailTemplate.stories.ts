import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import type { Piece } from "~/types";
import PieceDetailTemplate from "./PieceDetailTemplate.vue";

const meta: Meta<typeof PieceDetailTemplate> = {
  title: "Templates/PieceDetailTemplate",
  component: PieceDetailTemplate,
};

export default meta;
type Story = StoryObj<typeof PieceDetailTemplate>;

const pieceWithVideo: Piece = {
  id: "1",
  title: "交響曲第9番 ニ短調 Op.125",
  composer: "ベートーヴェン",
  videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const pieceWithoutVideo: Piece = {
  id: "2",
  title: "魔笛",
  composer: "モーツァルト",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

export const WithVideo: Story = {
  args: {
    piece: pieceWithVideo,
    error: null,
  },
};

export const WithoutVideo: Story = {
  args: {
    piece: pieceWithoutVideo,
    error: null,
  },
};

export const Error: Story = {
  args: {
    piece: null,
    error: new globalThis.Error("取得失敗"),
  },
};
