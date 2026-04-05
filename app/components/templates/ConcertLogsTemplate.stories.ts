import type { Meta, StoryObj } from "@storybook-vue/nuxt";
import type { ConcertLog } from "~/types";
import ConcertLogsTemplate from "./ConcertLogsTemplate.vue";

const meta: Meta<typeof ConcertLogsTemplate> = {
  title: "Templates/ConcertLogsTemplate",
  component: ConcertLogsTemplate,
};

export default meta;
type Story = StoryObj<typeof ConcertLogsTemplate>;

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
];

export const WithLogs: Story = {
  args: { logs: sampleLogs },
};

export const Empty: Story = {
  args: { logs: [] },
};
