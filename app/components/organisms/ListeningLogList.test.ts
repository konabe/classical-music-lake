import { mountSuspended } from "@nuxt/test-utils/runtime";
import ListeningLogList from "./ListeningLogList.vue";
import type { ListeningLog } from "~/types";

const makeLogs = (): ListeningLog[] => {
  return [
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
    {
      id: "log-2",
      userId: "user-1",
      listenedAt: "2024-02-01T10:00:00.000Z",
      composer: "モーツァルト",
      piece: "魔笛",
      rating: 4,
      isFavorite: true,
      createdAt: "2024-02-01T10:00:00.000Z",
      updatedAt: "2024-02-01T10:00:00.000Z",
    },
  ];
};

describe("ListeningLogList", () => {
  describe("空の状態", () => {
    it("logs が空のとき EmptyState が表示される", async () => {
      const wrapper = await mountSuspended(ListeningLogList, {
        props: { logs: [] },
      });
      expect(wrapper.findComponent({ name: "EmptyState" }).exists()).toBe(true);
    });

    it("logs が空のとき ul が表示されない", async () => {
      const wrapper = await mountSuspended(ListeningLogList, {
        props: { logs: [] },
      });
      expect(wrapper.find("ul.log-list").exists()).toBe(false);
    });
  });

  describe("リスト表示", () => {
    it("logs があるとき ul が表示される", async () => {
      const wrapper = await mountSuspended(ListeningLogList, {
        props: { logs: makeLogs() },
      });
      expect(wrapper.find("ul.log-list").exists()).toBe(true);
    });

    it("logs があるとき EmptyState が表示されない", async () => {
      const wrapper = await mountSuspended(ListeningLogList, {
        props: { logs: makeLogs() },
      });
      expect(wrapper.findComponent({ name: "EmptyState" }).exists()).toBe(false);
    });

    it("ログの件数分 ListeningLogItem が表示される", async () => {
      const wrapper = await mountSuspended(ListeningLogList, {
        props: { logs: makeLogs() },
      });
      expect(wrapper.findAllComponents({ name: "ListeningLogItem" })).toHaveLength(2);
    });
  });

  describe("イベント", () => {
    it("削除ボタンをクリックすると delete イベントが emit される", async () => {
      const wrapper = await mountSuspended(ListeningLogList, {
        props: { logs: makeLogs() },
      });
      await wrapper.findAll(".btn-danger")[0].trigger("click");
      expect(wrapper.emitted("delete")).toBeDefined();
    });

    it("1件目の削除ボタンで log-1 の ID が emit される", async () => {
      const wrapper = await mountSuspended(ListeningLogList, {
        props: { logs: makeLogs() },
      });
      await wrapper.findAll(".btn-danger")[0].trigger("click");
      const emitted = wrapper.emitted("delete") as [string][];
      expect(emitted[0][0]).toBe("log-1");
    });
  });
});
