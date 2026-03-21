import { describe, it, expect } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import EmptyState from "./EmptyState.vue";

describe("EmptyState", () => {
  it("スロットのテキストが表示される", async () => {
    const wrapper = await mountSuspended(EmptyState, {
      slots: { default: "まだ記録がありません。" },
    });
    expect(wrapper.text()).toBe("まだ記録がありません。");
  });

  it("empty-state クラスが存在する", async () => {
    const wrapper = await mountSuspended(EmptyState, {
      slots: { default: "空です" },
    });
    expect(wrapper.find(".empty-state").exists()).toBe(true);
  });

  it("div > p 構造で描画される", async () => {
    const wrapper = await mountSuspended(EmptyState, {
      slots: { default: "空です" },
    });
    expect(wrapper.find("div.empty-state p").exists()).toBe(true);
  });
});
