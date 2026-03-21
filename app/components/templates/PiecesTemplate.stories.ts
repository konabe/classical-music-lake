import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import type { Piece } from "~/types";
import PiecesTemplate from "./PiecesTemplate.vue";

const meta: Meta<typeof PiecesTemplate> = {
  title: "Templates/PiecesTemplate",
  component: PiecesTemplate,
};

export default meta;
type Story = StoryObj<typeof PiecesTemplate>;

const samplePieces: Piece[] = [
  {
    id: "1",
    title: "交響曲第9番 ニ短調 Op.125",
    composer: "ベートーヴェン",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    title: "ピアノ協奏曲第21番 ハ長調 K.467",
    composer: "モーツァルト",
    createdAt: "2024-01-02T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
  },
];

export const WithPieces: Story = {
  args: {
    pieces: samplePieces,
    error: null,
  },
};

export const EmptyState: Story = {
  args: {
    pieces: [],
    error: null,
  },
};

export const WithError: Story = {
  args: {
    pieces: [],
    error: new Error("取得失敗"),
  },
};
