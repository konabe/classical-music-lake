import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import type { Composer, Piece } from "~/types";
import PieceEditTemplate from "./PieceEditTemplate.vue";

const meta: Meta<typeof PieceEditTemplate> = {
  title: "Templates/PieceEditTemplate",
  component: PieceEditTemplate,
};

export default meta;
type Story = StoryObj<typeof PieceEditTemplate>;

const COMPOSER_ID_BEETHOVEN = "00000000-0000-4000-8000-000000000001";

const composers: Composer[] = [
  {
    id: COMPOSER_ID_BEETHOVEN,
    name: "ベートーヴェン",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

const samplePiece: Piece = {
  id: "1",
  title: "交響曲第9番 ニ短調 Op.125",
  composerId: COMPOSER_ID_BEETHOVEN,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

export const Default: Story = {
  args: { piece: samplePiece, fetchError: null, error: null, composers },
};

export const WithFetchError: Story = {
  args: { piece: null, fetchError: new Error("取得失敗"), error: null, composers },
};

export const WithSubmitError: Story = {
  args: {
    piece: samplePiece,
    fetchError: null,
    error: "更新に失敗しました。時間をおいて再度お試しください。",
    composers,
  },
};
