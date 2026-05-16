import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import type { Composer, PieceMovement, PieceWork } from "@/types";
import PieceEditTemplate from "@/components/templates/PieceEditTemplate.vue";

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

const samplePiece: PieceWork = {
  kind: "work",
  id: "1",
  title: "交響曲第9番 ニ短調 Op.125",
  composerId: COMPOSER_ID_BEETHOVEN,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const sampleMovements: PieceMovement[] = [
  {
    kind: "movement",
    id: "mov-1",
    parentId: "1",
    index: 0,
    title: "第一楽章 アレグロ・マ・ノン・トロッポ",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    kind: "movement",
    id: "mov-2",
    parentId: "1",
    index: 1,
    title: "第二楽章 モルト・ヴィヴァーチェ",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    kind: "movement",
    id: "mov-3",
    parentId: "1",
    index: 2,
    title: "第三楽章 アダージョ・モルト・エ・カンタービレ",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    kind: "movement",
    id: "mov-4",
    parentId: "1",
    index: 3,
    title: "第四楽章 プレスト",
    videoUrls: ["https://www.youtube.com/watch?v=example"],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

export const Default: Story = {
  args: {
    piece: samplePiece,
    fetchError: null,
    error: null,
    composers,
    movements: sampleMovements,
  },
};

export const WithFetchError: Story = {
  args: { piece: null, fetchError: new Error("取得失敗"), error: null, composers, movements: [] },
};

export const WithSubmitError: Story = {
  args: {
    piece: samplePiece,
    fetchError: null,
    error: "更新に失敗しました。時間をおいて再度お試しください。",
    composers,
    movements: sampleMovements,
  },
};

export const WithNoMovements: Story = {
  args: { piece: samplePiece, fetchError: null, error: null, composers, movements: [] },
};
