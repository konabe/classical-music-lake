import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import FeaturedPiece from "@/components/organisms/FeaturedPiece.vue";
import type { PieceWork } from "@/types";

const COMPOSER_ID_TCHAIKOVSKY = "00000000-0000-4000-8000-000000000001";
const COMPOSER_ID_BEETHOVEN = "00000000-0000-4000-8000-000000000002";
const COMPOSER_ID_BRAHMS = "00000000-0000-4000-8000-000000000003";

const composerNameById = {
  [COMPOSER_ID_TCHAIKOVSKY]: "チャイコフスキー",
  [COMPOSER_ID_BEETHOVEN]: "ベートーヴェン",
  [COMPOSER_ID_BRAHMS]: "ブラームス",
};

const makePiece = (overrides: Partial<PieceWork> = {}): PieceWork => ({
  kind: "work",
  id: "piece-1",
  title: "ピアノ協奏曲第1番 変ロ短調 Op.23",
  composerId: COMPOSER_ID_TCHAIKOVSKY,
  videoUrls: ["https://www.youtube.com/watch?v=dQw4w9WgXcQ"],
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  ...overrides,
});

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
        composerId: COMPOSER_ID_BEETHOVEN,
      }),
      makePiece({
        id: "3",
        title: "バイオリン協奏曲 ニ長調 Op.77",
        composerId: COMPOSER_ID_BRAHMS,
      }),
    ],
    loading: false,
    composerNameById,
  },
};

export const Loading: Story = {
  args: { pieces: [], loading: true, composerNameById },
};

export const Empty: Story = {
  args: { pieces: [], loading: false, composerNameById },
};

export const SinglePiece: Story = {
  args: { pieces: [makePiece()], loading: false, composerNameById },
};
