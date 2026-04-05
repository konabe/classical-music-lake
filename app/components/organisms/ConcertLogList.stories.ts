import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import type { ConcertLog } from "~/types";
import ConcertLogList from "./ConcertLogList.vue";

const meta: Meta<typeof ConcertLogList> = {
  title: "Organisms/ConcertLogList",
  component: ConcertLogList,
};

export default meta;
type Story = StoryObj<typeof ConcertLogList>;

const sampleLogs: ConcertLog[] = [
  {
    id: "1",
    userId: "user-1",
    concertDate: "2024-03-01T19:00:00.000Z",
    venue: "サントリーホール",
    conductor: "カラヤン",
    orchestra: "ベルリン・フィル",
    createdAt: "2024-03-01T09:00:00.000Z",
    updatedAt: "2024-03-01T09:00:00.000Z",
  },
  {
    id: "2",
    userId: "user-1",
    concertDate: "2024-02-15T18:30:00.000Z",
    venue: "NHKホール",
    conductor: "佐渡裕",
    orchestra: "NHK交響楽団",
    createdAt: "2024-02-15T09:00:00.000Z",
    updatedAt: "2024-02-15T09:00:00.000Z",
  },
];

export const WithLogs: Story = {
  args: { logs: sampleLogs },
};

export const Empty: Story = {
  args: { logs: [] },
};
