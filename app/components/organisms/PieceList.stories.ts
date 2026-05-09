import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import type { PieceWork } from "~/types";
import PieceList from "./PieceList.vue";

const meta: Meta<typeof PieceList> = {
  title: "Organisms/PieceList",
  component: PieceList,
};

export default meta;
type Story = StoryObj<typeof PieceList>;

const COMPOSER_ID_BEETHOVEN = "00000000-0000-4000-8000-000000000001";
const COMPOSER_ID_MOZART = "00000000-0000-4000-8000-000000000002";

const composerNameById = {
  [COMPOSER_ID_BEETHOVEN]: "ベートーヴェン",
  [COMPOSER_ID_MOZART]: "モーツァルト",
};

const samplePieces: PieceWork[] = [
  {
    kind: "work",
    id: "1",
    title: "交響曲第9番 ニ短調 Op.125",
    composerId: COMPOSER_ID_BEETHOVEN,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    kind: "work",
    id: "2",
    title: "ピアノ協奏曲第21番 ハ長調 K.467",
    composerId: COMPOSER_ID_MOZART,
    createdAt: "2024-01-02T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
  },
];

export const WithPieces: Story = {
  args: { pieces: samplePieces, error: null, composerNameById },
};

export const EmptyState: Story = {
  args: { pieces: [], error: null, composerNameById },
};

export const WithError: Story = {
  args: { pieces: [], error: new Error("取得失敗"), composerNameById },
};
