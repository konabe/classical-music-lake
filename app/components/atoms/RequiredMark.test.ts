import { describe, it, expect } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import RequiredMark from "./RequiredMark.vue";

describe("RequiredMark", () => {
  it("* が表示される", async () => {
    const wrapper = await mountSuspended(RequiredMark);
    expect(wrapper.text()).toBe("*");
  });

  it("required クラスが存在する", async () => {
    const wrapper = await mountSuspended(RequiredMark);
    expect(wrapper.find(".required").exists()).toBe(true);
  });

  it("span 要素として描画される", async () => {
    const wrapper = await mountSuspended(RequiredMark);
    expect(wrapper.element.tagName.toLowerCase()).toBe("span");
  });
});
