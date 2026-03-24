import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import type { ListeningLog } from "~/types";
import ListeningLogItem from "./ListeningLogItem.vue";

const meta: Meta<typeof ListeningLogItem> = {
  title: "Molecules/ListeningLogItem",
  component: ListeningLogItem,
};

export default meta;
type Story = StoryObj<typeof ListeningLogItem>;

const sampleLog: ListeningLog = {
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
};

export const WithMemo: Story = {
  args: { listeningLog: sampleLog },
};

export const WithoutMemo: Story = {
  args: {
    listeningLog: {
      ...sampleLog,
      id: "2",
      composer: "モーツァルト",
      piece: "ピアノ協奏曲第21番 ハ長調 K.467",
      rating: 4,
      isFavorite: false,
      memo: undefined,
    },
  },
};

export const NotFavorite: Story = {
  args: {
    listeningLog: {
      ...sampleLog,
      isFavorite: false,
      memo: undefined,
    },
  },
};
