import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import type { ListeningLog } from "~/types";
import ListeningLogEditTemplate from "./ListeningLogEditTemplate.vue";

const meta: Meta<typeof ListeningLogEditTemplate> = {
  title: "Templates/ListeningLogEditTemplate",
  component: ListeningLogEditTemplate,
};

export default meta;
type Story = StoryObj<typeof ListeningLogEditTemplate>;

const sampleLog: ListeningLog = {
  id: "1",
  userId: null,
  listenedAt: "2024-03-01T14:00:00.000Z",
  composer: "ベートーヴェン",
  piece: "交響曲第9番 ニ短調 Op.125",
  rating: 5,
  isFavorite: true,
  memo: "フルトヴェングラー指揮。",
  createdAt: "2024-03-01T14:00:00.000Z",
  updatedAt: "2024-03-01T14:00:00.000Z",
};

export const Default: Story = {
  args: {
    log: sampleLog,
    error: null,
  },
};

export const WithError: Story = {
  args: {
    log: sampleLog,
    error: "更新に失敗しました。時間をおいて再度お試しください。",
  },
};
