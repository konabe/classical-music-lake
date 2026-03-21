import { describe, it, expect } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import RatingSelector from "./RatingSelector.vue";

describe("RatingSelector", () => {
  it("星ボタンが5つ表示される", async () => {
    const wrapper = await mountSuspended(RatingSelector, { props: { modelValue: 3 } });
    expect(wrapper.findAll(".star-btn")).toHaveLength(5);
  });

  it("modelValue=3 のとき星3つが active になる", async () => {
    const wrapper = await mountSuspended(RatingSelector, { props: { modelValue: 3 } });
    expect(wrapper.findAll(".star-btn.active")).toHaveLength(3);
  });

  it("modelValue=5 のとき星5つがすべて active になる", async () => {
    const wrapper = await mountSuspended(RatingSelector, { props: { modelValue: 5 } });
    expect(wrapper.findAll(".star-btn.active")).toHaveLength(5);
  });

  it("5番目の星をクリックすると update:modelValue に 5 が emit される", async () => {
    const wrapper = await mountSuspended(RatingSelector, { props: { modelValue: 3 } });
    await wrapper.findAll(".star-btn")[4].trigger("click");
    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    expect(wrapper.emitted("update:modelValue")![0]).toEqual([5]);
  });

  it("1番目の星をクリックすると update:modelValue に 1 が emit される", async () => {
    const wrapper = await mountSuspended(RatingSelector, { props: { modelValue: 3 } });
    await wrapper.findAll(".star-btn")[0].trigger("click");
    expect(wrapper.emitted("update:modelValue")![0]).toEqual([1]);
  });
});
