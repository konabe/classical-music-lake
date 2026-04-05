import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import type { ConcertLog } from "~/types";
import ConcertLogEditTemplate from "./ConcertLogEditTemplate.vue";

const meta: Meta<typeof ConcertLogEditTemplate> = {
  title: "Templates/ConcertLogEditTemplate",
  component: ConcertLogEditTemplate,
};

export default meta;
type Story = StoryObj<typeof ConcertLogEditTemplate>;

const sampleLog: ConcertLog = {
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
