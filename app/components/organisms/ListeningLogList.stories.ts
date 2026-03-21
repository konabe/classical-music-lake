import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import type { ListeningLog } from "~/types";
import ListeningLogList from "./ListeningLogList.vue";

const meta: Meta<typeof ListeningLogList> = {
  title: "Organisms/ListeningLogList",
  component: ListeningLogList,
};

export default meta;
type Story = StoryObj<typeof ListeningLogList>;

const sampleLogs: ListeningLog[] = [
  {
    id: "1",
    userId: null,
    listenedAt: "2024-03-01T14:00:00.000Z",
    composer: "ベートーヴェン",
    piece: "交響曲第9番 ニ短調 Op.125",
    rating: 5,
    isFavorite: true,
    memo: "フルトヴェングラー指揮、バイロイト祝祭管弦楽団。歴史的名演。",
    createdAt: "2024-03-01T14:00:00.000Z",
    updatedAt: "2024-03-01T14:00:00.000Z",
  },
  {
    id: "2",
    userId: null,
    listenedAt: "2024-02-15T20:30:00.000Z",
    composer: "モーツァルト",
    piece: "ピアノ協奏曲第21番 ハ長調 K.467",
    rating: 4,
    isFavorite: false,
    createdAt: "2024-02-15T20:30:00.000Z",
    updatedAt: "2024-02-15T20:30:00.000Z",
  },
];

export const WithLogs: Story = {
  args: {
    logs: sampleLogs,
  },
};

export const EmptyState: Story = {
  args: {
    logs: [],
  },
};
