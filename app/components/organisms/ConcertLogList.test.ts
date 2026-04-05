import { mountSuspended } from "@nuxt/test-utils/runtime";
import ConcertLogList from "./ConcertLogList.vue";
import type { ConcertLog } from "~/types";

const sampleLogs: ConcertLog[] = [
  {
    id: "1",
    userId: "user-1",
    concertDate: "2024-03-01T19:00:00.000Z",
    venue: "サントリーホール",
    createdAt: "2024-03-01T09:00:00.000Z",
    updatedAt: "2024-03-01T09:00:00.000Z",
  },
];

describe("ConcertLogList", () => {
  it("logs が空のとき EmptyState が表示される", async () => {
    const wrapper = await mountSuspended(ConcertLogList, {
      props: { logs: [] },
    });
    expect(wrapper.findComponent({ name: "EmptyState" }).exists()).toBe(true);
  });

  it("logs があるとき ConcertLogItem が表示される", async () => {
    const wrapper = await mountSuspended(ConcertLogList, {
      props: { logs: sampleLogs },
    });
    expect(wrapper.findAllComponents({ name: "ConcertLogItem" })).toHaveLength(1);
  });
});
