import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import type { ListeningLog, Piece } from "~/types";
import PieceDetailTemplate from "./PieceDetailTemplate.vue";

const meta: Meta<typeof PieceDetailTemplate> = {
  title: "Templates/PieceDetailTemplate",
  component: PieceDetailTemplate,
};

export default meta;
type Story = StoryObj<typeof PieceDetailTemplate>;

const COMPOSER_ID_BEETHOVEN = "00000000-0000-4000-8000-000000000001";
const COMPOSER_ID_MOZART = "00000000-0000-4000-8000-000000000002";

const pieceWithVideo: Piece = {
  id: "1",
  title: "交響曲第9番 ニ短調 Op.125",
  composerId: COMPOSER_ID_BEETHOVEN,
  videoUrls: ["https://www.youtube.com/watch?v=dQw4w9WgXcQ"],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const pieceWithMultipleVideos: Piece = {
  id: "5",
  title: "交響曲第9番 ニ短調 Op.125",
  composerId: COMPOSER_ID_BEETHOVEN,
  videoUrls: [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com/watch?v=abc123",
    "https://www.youtube.com/watch?v=def456",
  ],
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const pieceWithoutVideo: Piece = {
  id: "2",
  title: "魔笛",
  composerId: COMPOSER_ID_MOZART,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

export const WithVideo: Story = {
  args: {
    piece: pieceWithVideo,
    error: null,
    isAdmin: false,
    composerName: "ベートーヴェン",
  },
};

export const WithVideoAdmin: Story = {
  args: {
    piece: pieceWithVideo,
    error: null,
    isAdmin: true,
    composerName: "ベートーヴェン",
  },
};

export const WithMultipleVideos: Story = {
  args: {
    piece: pieceWithMultipleVideos,
    error: null,
    isAdmin: false,
    composerName: "ベートーヴェン",
  },
};

export const WithoutVideo: Story = {
  args: {
    piece: pieceWithoutVideo,
    error: null,
    isAdmin: false,
    composerName: "モーツァルト",
  },
};

export const WithError: Story = {
  args: {
    piece: null,
    error: new globalThis.Error("取得失敗"),
    isAdmin: false,
    composerName: "",
  },
};

export const WithAllCategories: Story = {
  args: {
    piece: {
      ...pieceWithoutVideo,
      id: "3",
      genre: "その他",
      era: "近現代",
      formation: "管弦楽",
      region: "ロシア",
    },
    error: null,
    isAdmin: false,
    composerName: "モーツァルト",
  },
};

export const WithPartialCategories: Story = {
  args: {
    piece: {
      ...pieceWithoutVideo,
      id: "4",
      genre: "交響曲",
      era: "バロック",
    },
    error: null,
    isAdmin: false,
    composerName: "モーツァルト",
  },
};

const sampleListeningLogs: ListeningLog[] = [
  {
    id: "log-1",
    userId: "user-1",
    listenedAt: "2024-03-10T12:00:00.000Z",
    composer: "モーツァルト",
    piece: "魔笛",
    rating: 5,
    isFavorite: true,
    memo: "夜の女王のアリアが圧巻",
    createdAt: "2024-03-10T12:00:00.000Z",
    updatedAt: "2024-03-10T12:00:00.000Z",
  },
  {
    id: "log-2",
    userId: "user-1",
    listenedAt: "2024-02-01T08:30:00.000Z",
    composer: "モーツァルト",
    piece: "魔笛",
    rating: 4,
    isFavorite: false,
    createdAt: "2024-02-01T08:30:00.000Z",
    updatedAt: "2024-02-01T08:30:00.000Z",
  },
];

export const WithListeningLogs: Story = {
  args: {
    piece: pieceWithoutVideo,
    error: null,
    isAdmin: false,
    composerName: "モーツァルト",
    listeningLogs: sampleListeningLogs,
  },
};
