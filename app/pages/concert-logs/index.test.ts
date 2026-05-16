import { mountSuspended } from "@nuxt/test-utils/runtime";
import ConcertLogsPage from "@/pages/concert-logs/index.vue";
import type { ConcertLog } from "@/types";

const sampleLogs: ConcertLog[] = [
  {
    id: "cl-001",
    userId: "user-1",
    title: "東京交響楽団 定期演奏会",
    concertDate: "2024-03-01T19:00:00.000Z",
    venue: "サントリーホール",
    conductor: "カラヤン",
    createdAt: "2024-03-01T20:00:00.000Z",
    updatedAt: "2024-03-01T20:00:00.000Z",
  },
];

vi.mock("~/composables/useConcertLogs", () => ({
  useConcertLogs: () => ({
    data: sampleLogs,
    error: null,
    pending: false,
    refresh: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteLog: vi.fn(),
  }),
  useConcertLog: () => ({ data: null, error: null }),
}));

describe("ConcertLogsPage", () => {
  it("ConcertLogsTemplate が表示される", async () => {
    const wrapper = await mountSuspended(ConcertLogsPage);
    expect(wrapper.text()).toContain("東京交響楽団 定期演奏会");
  });
});
