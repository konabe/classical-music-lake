import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import PieceListInfinite from "./PieceListInfinite.vue";
import type { Piece } from "~/types";

const COMPOSER_ID_BEETHOVEN = "00000000-0000-4000-8000-000000000001";
const COMPOSER_ID_TCHAIKOVSKY = "00000000-0000-4000-8000-000000000002";

const composerNameById = {
  [COMPOSER_ID_BEETHOVEN]: "ベートーヴェン",
  [COMPOSER_ID_TCHAIKOVSKY]: "チャイコフスキー",
};

const samplePieces: Piece[] = [
  {
    id: "piece-1",
    title: "交響曲第9番 ニ短調 Op.125「合唱」",
    composerId: COMPOSER_ID_BEETHOVEN,
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
    composerId: COMPOSER_ID_TCHAIKOVSKY,
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
  args: { pieces: samplePieces, error: null, pending: false, hasMore: true, composerNameById },
};

export const Loading: Story = {
  args: { pieces: samplePieces, error: null, pending: true, hasMore: true, composerNameById },
};

export const EndOfList: Story = {
  args: { pieces: samplePieces, error: null, pending: false, hasMore: false, composerNameById },
};

export const ErrorState: Story = {
  args: {
    pieces: samplePieces,
    error: new Error("network"),
    pending: false,
    hasMore: true,
    composerNameById,
  },
};

export const Empty: Story = {
  args: { pieces: [], error: null, pending: false, hasMore: true, composerNameById },
};
