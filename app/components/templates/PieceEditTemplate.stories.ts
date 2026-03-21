import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import type { Piece } from "~/types";
import PieceEditTemplate from "./PieceEditTemplate.vue";

const meta: Meta<typeof PieceEditTemplate> = {
  title: "Templates/PieceEditTemplate",
  component: PieceEditTemplate,
};

export default meta;
type Story = StoryObj<typeof PieceEditTemplate>;

const samplePiece: Piece = {
  id: "1",
  title: "交響曲第9番 ニ短調 Op.125",
  composer: "ベートーヴェン",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

export const Default: Story = {
  args: {
    piece: samplePiece,
    fetchError: null,
    errorMessage: "",
  },
};

export const WithFetchError: Story = {
  args: {
    piece: null,
    fetchError: new Error("取得失敗"),
    errorMessage: "",
  },
};

export const WithSubmitError: Story = {
  args: {
    piece: samplePiece,
    fetchError: null,
    errorMessage: "更新に失敗しました。時間をおいて再度お試しください。",
  },
};
