import { mountSuspended } from "@nuxt/test-utils/runtime";
import ListeningLogsTemplate from "./ListeningLogsTemplate.vue";
import type { ListeningLog } from "~/types";

const sampleLogs: ListeningLog[] = [
  {
    id: "log-1",
    userId: "user-1",
    listenedAt: "2024-01-15T19:30:00.000Z",
    composer: "ベートーヴェン",
    piece: "交響曲第9番",
    rating: 5,
    isFavorite: false,
    createdAt: "2024-01-15T20:00:00.000Z",
    updatedAt: "2024-01-15T20:00:00.000Z",
  },
];

describe("ListeningLogsTemplate", () => {
  it("ページヘッダーが表示される", async () => {
    const wrapper = await mountSuspended(ListeningLogsTemplate, {
      props: { logs: [] },
    });
    expect(wrapper.text()).toContain("鑑賞記録");
  });

  it("新規追加ボタンが表示される", async () => {
    const wrapper = await mountSuspended(ListeningLogsTemplate, {
      props: { logs: [] },
    });
    expect(wrapper.text()).toContain("新しい記録");
  });

  it("logs を渡すと ListeningLogList に伝達される", async () => {
    const wrapper = await mountSuspended(ListeningLogsTemplate, {
      props: { logs: sampleLogs },
    });
    expect(wrapper.findAllComponents({ name: "ListeningLogItem" })).toHaveLength(1);
  });

  it("delete イベントが上位に伝達される", async () => {
    const wrapper = await mountSuspended(ListeningLogsTemplate, {
      props: { logs: sampleLogs },
    });
    await wrapper.find(".btn-danger").trigger("click");
    expect(wrapper.emitted("delete")).toBeDefined();
  });
});
