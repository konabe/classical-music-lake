import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import type { ConcertLog } from "~/types";
import ConcertLogItem from "./ConcertLogItem.vue";

const meta: Meta<typeof ConcertLogItem> = {
  title: "Molecules/ConcertLogItem",
  component: ConcertLogItem,
};

export default meta;
type Story = StoryObj<typeof ConcertLogItem>;

const sampleLog: ConcertLog = {
  id: "1",
  userId: "user-1",
  concertDate: "2024-03-01T19:00:00.000Z",
  venue: "サントリーホール",
  conductor: "カラヤン",
  orchestra: "ベルリン・フィルハーモニー管弦楽団",
  soloist: "アルゲリッチ",
  createdAt: "2024-03-01T09:00:00.000Z",
  updatedAt: "2024-03-01T09:00:00.000Z",
};

export const Full: Story = {
  args: { concertLog: sampleLog },
};

export const WithTitle: Story = {
  args: {
    concertLog: {
      ...sampleLog,
      title: "ベルリン・フィル来日公演 2024",
    },
  },
};

export const VenueOnly: Story = {
  args: {
    concertLog: {
      ...sampleLog,
      conductor: undefined,
      orchestra: undefined,
      soloist: undefined,
    },
  },
};

export const WithoutSoloist: Story = {
  args: {
    concertLog: {
      ...sampleLog,
      soloist: undefined,
    },
  },
};
