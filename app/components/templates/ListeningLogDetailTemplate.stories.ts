import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import type { ListeningLog } from "~/types";
import ListeningLogDetailTemplate from "./ListeningLogDetailTemplate.vue";

const meta: Meta<typeof ListeningLogDetailTemplate> = {
  title: "Templates/ListeningLogDetailTemplate",
  component: ListeningLogDetailTemplate,
};

export default meta;
type Story = StoryObj<typeof ListeningLogDetailTemplate>;

const baseLog: ListeningLog = {
  id: "1",
  userId: null,
  listenedAt: "2024-03-01T14:00:00.000Z",
  composer: "ベートーヴェン",
  piece: "交響曲第9番 ニ短調 Op.125",
  rating: 5,
  isFavorite: false,
  createdAt: "2024-03-01T14:00:00.000Z",
  updatedAt: "2024-03-01T14:00:00.000Z",
};

export const Default: Story = {
  args: {
    log: baseLog,
  },
};

export const WithFavorite: Story = {
  args: {
    log: { ...baseLog, isFavorite: true },
  },
};

export const WithMemo: Story = {
  args: {
    log: {
      ...baseLog,
      memo: "フルトヴェングラー指揮、バイロイト祝祭管弦楽団。歴史的名演。第四楽章のテンポが絶品だった。",
    },
  },
};
