import { mountSuspended } from "@nuxt/test-utils/runtime";
import ComposerListInfinite from "./ComposerListInfinite.vue";
import type { Composer } from "~/types";

const sampleComposers: Composer[] = [
  {
    id: "1",
    name: "ベートーヴェン",
    createdAt: "2024-06-01T00:00:00.000Z",
    updatedAt: "2024-06-01T00:00:00.000Z",
  },
];

describe("ComposerListInfinite", () => {
  it("読み込み中のメッセージを表示する", async () => {
    const wrapper = await mountSuspended(ComposerListInfinite, {
      props: { composers: sampleComposers, error: null, pending: true, hasMore: true },
    });
    expect(wrapper.text()).toContain("読み込み中");
  });

  it("これ以上ない場合のメッセージを表示する", async () => {
    const wrapper = await mountSuspended(ComposerListInfinite, {
      props: { composers: sampleComposers, error: null, pending: false, hasMore: false },
    });
    expect(wrapper.text()).toContain("これ以上ありません");
  });

  it("エラー時に再試行ボタンを表示する", async () => {
    const wrapper = await mountSuspended(ComposerListInfinite, {
      props: {
        composers: [],
        error: new Error("fail"),
        pending: false,
        hasMore: true,
      },
    });
    expect(wrapper.find(".btn-retry").exists()).toBe(true);
  });

  it("再試行ボタンクリックで retry イベントが emit される", async () => {
    const wrapper = await mountSuspended(ComposerListInfinite, {
      props: {
        composers: [],
        error: new Error("fail"),
        pending: false,
        hasMore: true,
      },
    });
    await wrapper.find(".btn-retry").trigger("click");
    expect(wrapper.emitted("retry")).toBeDefined();
  });
});
