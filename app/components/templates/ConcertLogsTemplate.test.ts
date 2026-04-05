import { mountSuspended } from "@nuxt/test-utils/runtime";
import ConcertLogsTemplate from "./ConcertLogsTemplate.vue";
import type { ConcertLog } from "~/types";

const sampleLogs: ConcertLog[] = [
  {
    id: "log-1",
    userId: "user-1",
    concertDate: "2024-01-15T19:00:00.000Z",
    venue: "サントリーホール",
    createdAt: "2024-01-15T20:00:00.000Z",
    updatedAt: "2024-01-15T20:00:00.000Z",
  },
];

describe("ConcertLogsTemplate", () => {
  it("ページヘッダーが表示される", async () => {
    const wrapper = await mountSuspended(ConcertLogsTemplate, {
      props: { logs: [] },
    });
    expect(wrapper.text()).toContain("コンサート記録");
  });

  it("新規追加ボタンが表示される", async () => {
    const wrapper = await mountSuspended(ConcertLogsTemplate, {
      props: { logs: [] },
    });
    expect(wrapper.text()).toContain("新しい記録");
  });

  it("logs を渡すと ConcertLogItem に伝達される", async () => {
    const wrapper = await mountSuspended(ConcertLogsTemplate, {
      props: { logs: sampleLogs },
    });
    expect(wrapper.findAllComponents({ name: "ConcertLogItem" })).toHaveLength(1);
  });
});
