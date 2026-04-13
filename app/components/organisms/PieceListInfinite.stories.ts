import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import PieceListInfinite from "./PieceListInfinite.vue";
import type { Piece } from "~/types";

const samplePieces: Piece[] = [
  {
    id: "piece-1",
    title: "交響曲第9番 ニ短調 Op.125「合唱」",
    composer: "ベートーヴェン",
    genre: "交響曲",
    era: "古典派",
    formation: "管弦楽",
    region: "ドイツ・オーストリア",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "piece-2",
    title: "ピアノ協奏曲第1番 変ロ短調 Op.23",
    composer: "チャイコフスキー",
    genre: "協奏曲",
    era: "ロマン派",
    formation: "管弦楽",
    region: "ロシア",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

const meta: Meta<typeof PieceListInfinite> = {
  title: "Organisms/PieceListInfinite",
  component: PieceListInfinite,
};

export default meta;
type Story = StoryObj<typeof PieceListInfinite>;

export const Default: Story = {
  args: { pieces: samplePieces, error: null, pending: false, hasMore: true },
};

export const Loading: Story = {
  args: { pieces: samplePieces, error: null, pending: true, hasMore: true },
};

export const EndOfList: Story = {
  args: { pieces: samplePieces, error: null, pending: false, hasMore: false },
};

export const ErrorState: Story = {
  args: {
    pieces: samplePieces,
    error: new Error("network"),
    pending: false,
    hasMore: true,
  },
};

export const Empty: Story = {
  args: { pieces: [], error: null, pending: false, hasMore: true },
};
