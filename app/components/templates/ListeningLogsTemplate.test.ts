import { mountSuspended } from "@nuxt/test-utils/runtime";
import ListeningLogsTemplate from "./ListeningLogsTemplate.vue";
import type { ListeningLog } from "~/types";
import type { ListeningLogFilterState } from "~/composables/useListeningLogFilter";

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

const emptyFilter: ListeningLogFilterState = {
  keyword: "",
  rating: "",
  favoriteOnly: false,
  fromDate: "",
  toDate: "",
};

const baseProps = {
  filterState: emptyFilter,
  filterActive: false,
  totalCount: 0,
};

describe("ListeningLogsTemplate", () => {
  it("ページヘッダーが表示される", async () => {
    const wrapper = await mountSuspended(ListeningLogsTemplate, {
      props: { ...baseProps, logs: [] },
    });
    expect(wrapper.text()).toContain("鑑賞記録");
  });

  it("新規追加ボタンが表示される", async () => {
    const wrapper = await mountSuspended(ListeningLogsTemplate, {
      props: { ...baseProps, logs: [] },
    });
    expect(wrapper.text()).toContain("新しい記録");
  });

  it("統計ページへのリンクが表示される", async () => {
    const wrapper = await mountSuspended(ListeningLogsTemplate, {
      props: { ...baseProps, logs: [] },
    });
    expect(wrapper.find('a[href="/listening-logs/statistics"]').exists()).toBe(true);
  });

  it("logs を渡すと ListeningLogList に伝達される", async () => {
    const wrapper = await mountSuspended(ListeningLogsTemplate, {
      props: { ...baseProps, logs: sampleLogs, totalCount: sampleLogs.length },
    });
    expect(wrapper.findAllComponents({ name: "ListeningLogItem" })).toHaveLength(1);
  });

  it("delete イベントが上位に伝達される", async () => {
    const wrapper = await mountSuspended(ListeningLogsTemplate, {
      props: { ...baseProps, logs: sampleLogs, totalCount: sampleLogs.length },
    });
    await wrapper.find(".btn-danger").trigger("click");
    expect(wrapper.emitted("delete")).toBeDefined();
  });

  describe("フィルタ", () => {
    it("filterActive が true のとき件数サマリが表示される", async () => {
      const wrapper = await mountSuspended(ListeningLogsTemplate, {
        props: {
          ...baseProps,
          logs: sampleLogs,
          totalCount: 5,
          filterActive: true,
          filterState: { ...emptyFilter, keyword: "ベー" },
        },
      });
      expect(wrapper.text()).toContain("1 / 5 件を表示中");
    });

    it("ListeningLogFilter からの reset イベントを伝搬する", async () => {
      const wrapper = await mountSuspended(ListeningLogsTemplate, {
        props: {
          ...baseProps,
          logs: sampleLogs,
          totalCount: 1,
          filterActive: true,
          filterState: { ...emptyFilter, keyword: "ベー" },
        },
      });
      await wrapper.find(".btn-secondary").trigger("click");
      expect(wrapper.emitted("reset-filter")).toBeDefined();
    });
  });
});
