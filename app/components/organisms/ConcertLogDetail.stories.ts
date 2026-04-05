import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import type { ConcertLog, Piece } from "~/types";
import ConcertLogDetail from "./ConcertLogDetail.vue";

const meta: Meta<typeof ConcertLogDetail> = {
  title: "Organisms/ConcertLogDetail",
  component: ConcertLogDetail,
};

export default meta;
type Story = StoryObj<typeof ConcertLogDetail>;

const baseLog: ConcertLog = {
  id: "log-1",
  userId: "user-1",
  concertDate: "2024-01-15T19:00:00.000Z",
  venue: "サントリーホール",
  conductor: "小澤征爾",
  orchestra: "ベルリン・フィルハーモニー管弦楽団",
  soloist: "アルゲリッチ",
  createdAt: "2024-01-15T20:00:00.000Z",
  updatedAt: "2024-01-15T20:00:00.000Z",
};

const samplePieces: Piece[] = [
  {
    id: "piece-1",
    title: "交響曲第9番",
    composer: "ベートーヴェン",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "piece-2",
    title: "ピアノ協奏曲第1番",
    composer: "チャイコフスキー",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

export const Default: Story = {
  args: {
    log: baseLog,
    pieces: [],
  },
};

export const Minimal: Story = {
  args: {
    log: {
      ...baseLog,
      conductor: undefined,
      orchestra: undefined,
      soloist: undefined,
    },
    pieces: [],
  },
};

export const WithoutSoloist: Story = {
  args: {
    log: {
      ...baseLog,
      soloist: undefined,
    },
    pieces: [],
  },
};

export const WithProgram: Story = {
  args: {
    log: {
      ...baseLog,
      pieceIds: ["piece-1", "piece-2"],
    },
    pieces: samplePieces,
  },
};
