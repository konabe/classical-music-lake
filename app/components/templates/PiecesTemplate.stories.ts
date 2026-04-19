import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import type { Piece } from "~/types";
import PiecesTemplate from "./PiecesTemplate.vue";

const meta: Meta<typeof PiecesTemplate> = {
  title: "Templates/PiecesTemplate",
  component: PiecesTemplate,
};

export default meta;
type Story = StoryObj<typeof PiecesTemplate>;

const COMPOSER_ID_BEETHOVEN = "00000000-0000-4000-8000-000000000001";
const COMPOSER_ID_MOZART = "00000000-0000-4000-8000-000000000002";

const composerNameById = {
  [COMPOSER_ID_BEETHOVEN]: "ベートーヴェン",
  [COMPOSER_ID_MOZART]: "モーツァルト",
};

const samplePieces: Piece[] = [
  {
    id: "1",
    title: "交響曲第9番 ニ短調 Op.125",
    composerId: COMPOSER_ID_BEETHOVEN,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    title: "ピアノ協奏曲第21番 ハ長調 K.467",
    composerId: COMPOSER_ID_MOZART,
    createdAt: "2024-01-02T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
  },
];

const baseArgs = {
  pending: false,
  hasMore: false,
  composerNameById,
};

export const WithPieces: Story = {
  args: { ...baseArgs, pieces: samplePieces, error: null, isAdmin: false },
};

export const WithPiecesAdmin: Story = {
  args: { ...baseArgs, pieces: samplePieces, error: null, isAdmin: true },
};

export const EmptyState: Story = {
  args: { ...baseArgs, pieces: [], error: null, isAdmin: false },
};

export const WithError: Story = {
  args: { ...baseArgs, pieces: [], error: new Error("取得失敗"), isAdmin: false },
};
