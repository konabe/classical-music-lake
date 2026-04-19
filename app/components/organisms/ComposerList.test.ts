import { mountSuspended } from "@nuxt/test-utils/runtime";
import ComposerList from "./ComposerList.vue";
import type { Composer } from "~/types";

const sampleComposers: Composer[] = [
  {
    id: "1",
    name: "ベートーヴェン",
    createdAt: "2024-06-01T00:00:00.000Z",
    updatedAt: "2024-06-01T00:00:00.000Z",
  },
  {
    id: "2",
    name: "モーツァルト",
    createdAt: "2024-06-01T00:00:00.000Z",
    updatedAt: "2024-06-01T00:00:00.000Z",
  },
];

describe("ComposerList", () => {
  describe("表示", () => {
    it("作曲家が渡されるとリスト表示される", async () => {
      const wrapper = await mountSuspended(ComposerList, {
        props: { composers: sampleComposers, error: null },
      });
      expect(wrapper.findAll(".composer-list li")).toHaveLength(2);
    });

    it("空リストの場合は EmptyState を表示する", async () => {
      const wrapper = await mountSuspended(ComposerList, {
        props: { composers: [], error: null },
      });
      expect(wrapper.text()).toContain("作曲家が登録されていません");
    });

    it("error が渡されるとエラーメッセージを表示する", async () => {
      const wrapper = await mountSuspended(ComposerList, {
        props: { composers: [], error: new Error("取得失敗") },
      });
      expect(wrapper.text()).toContain("作曲家一覧の取得に失敗しました");
    });
  });
});
