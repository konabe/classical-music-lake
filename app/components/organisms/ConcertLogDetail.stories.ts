import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import type { ConcertLog } from "~/types";
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

export const Default: Story = {
  args: {
    log: baseLog,
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
  },
};

export const WithoutSoloist: Story = {
  args: {
    log: {
      ...baseLog,
      soloist: undefined,
    },
  },
};
