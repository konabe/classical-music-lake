import { mountSuspended } from "@nuxt/test-utils/runtime";
import ListeningLogStatistics from "./ListeningLogStatistics.vue";
import type { ListeningLogStatistics as Stats } from "~/composables/useListeningLogStatistics";

const emptyStats: Stats = {
  total: 0,
  favoriteCount: 0,
  averageRating: 0,
  ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  topComposers: [],
  monthlyTrend: [],
};

const populatedStats: Stats = {
  total: 10,
  favoriteCount: 4,
  averageRating: 4.2,
  ratingDistribution: { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 },
  topComposers: [
    { composerName: "ベートーヴェン", count: 5 },
    { composerName: "モーツァルト", count: 3 },
  ],
  monthlyTrend: [
    { month: "2024-01", count: 4 },
    { month: "2024-02", count: 6 },
  ],
};

describe("ListeningLogStatistics", () => {
  describe("表示", () => {
    it("サマリ（総数・お気に入り・平均評価）が表示される", async () => {
      const wrapper = await mountSuspended(ListeningLogStatistics, {
        props: { statistics: populatedStats },
      });
      expect(wrapper.text()).toContain("Total entries");
      expect(wrapper.text()).toContain("10");
      expect(wrapper.text()).toContain("Favorites");
      expect(wrapper.text()).toContain("4");
      expect(wrapper.text()).toContain("Average rating");
      expect(wrapper.text()).toContain("4.20");
    });

    it("作曲家ランキングが表示される", async () => {
      const wrapper = await mountSuspended(ListeningLogStatistics, {
        props: { statistics: populatedStats },
      });
      expect(wrapper.text()).toContain("ベートーヴェン");
      expect(wrapper.text()).toContain("モーツァルト");
    });

    it("月別トレンドが YYYY/MM 形式で表示される", async () => {
      const wrapper = await mountSuspended(ListeningLogStatistics, {
        props: { statistics: populatedStats },
      });
      expect(wrapper.text()).toContain("2024/01");
      expect(wrapper.text()).toContain("2024/02");
    });
  });

  describe("空状態", () => {
    it("total が 0 のとき空メッセージが表示される", async () => {
      const wrapper = await mountSuspended(ListeningLogStatistics, {
        props: { statistics: emptyStats },
      });
      expect(wrapper.text()).toContain("まだ鑑賞記録がありません");
    });

    it("total が 0 のとき平均評価は — 表示", async () => {
      const wrapper = await mountSuspended(ListeningLogStatistics, {
        props: { statistics: emptyStats },
      });
      expect(wrapper.text()).toContain("—");
    });
  });
});
