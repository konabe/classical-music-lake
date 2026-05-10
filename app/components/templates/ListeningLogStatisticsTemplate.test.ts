import { mountSuspended } from "@nuxt/test-utils/runtime";
import ListeningLogStatisticsTemplate from "./ListeningLogStatisticsTemplate.vue";
import type { ListeningLogStatistics } from "~/composables/useListeningLogStatistics";

const stats: ListeningLogStatistics = {
  total: 3,
  favoriteCount: 1,
  averageRating: 4,
  ratingDistribution: { 1: 0, 2: 0, 3: 1, 4: 1, 5: 1 },
  topComposers: [{ composerName: "ベートーヴェン", count: 2 }],
  monthlyTrend: [{ month: "2024-01", count: 3 }],
};

describe("ListeningLogStatisticsTemplate", () => {
  it("ページヘッダーが表示される", async () => {
    const wrapper = await mountSuspended(ListeningLogStatisticsTemplate, {
      props: { statistics: stats },
    });
    expect(wrapper.text()).toContain("統計");
  });

  it("一覧へ戻るリンクが表示される", async () => {
    const wrapper = await mountSuspended(ListeningLogStatisticsTemplate, {
      props: { statistics: stats },
    });
    expect(wrapper.find('a[href="/listening-logs"]').exists()).toBe(true);
  });

  it("統計コンポーネントに渡されたデータが描画される", async () => {
    const wrapper = await mountSuspended(ListeningLogStatisticsTemplate, {
      props: { statistics: stats },
    });
    expect(wrapper.text()).toContain("ベートーヴェン");
    expect(wrapper.text()).toContain("2024/01");
  });
});
