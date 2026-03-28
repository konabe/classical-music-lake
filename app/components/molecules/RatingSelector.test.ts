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
    expect(wrapper.emitted("update:modelValue")).toBeDefined();
    expect(wrapper.emitted("update:modelValue")![0]).toEqual([5]);
  });

  it("1番目の星をクリックすると update:modelValue に 1 が emit される", async () => {
    const wrapper = await mountSuspended(RatingSelector, { props: { modelValue: 3 } });
    await wrapper.findAll(".star-btn")[0].trigger("click");
    expect(wrapper.emitted("update:modelValue")![0]).toEqual([1]);
  });

  it("各ボタンに aria-label が設定されている", async () => {
    const wrapper = await mountSuspended(RatingSelector, { props: { modelValue: 3 } });
    const buttons = wrapper.findAll(".star-btn");
    buttons.forEach((btn, i) => {
      expect(btn.attributes("aria-label")).toBe(`${i + 1}星`);
    });
  });

  it("modelValue=3 のとき1〜3番目のボタンの aria-pressed が true", async () => {
    const wrapper = await mountSuspended(RatingSelector, { props: { modelValue: 3 } });
    const buttons = wrapper.findAll(".star-btn");
    expect(buttons[0].attributes("aria-pressed")).toBe("true");
    expect(buttons[2].attributes("aria-pressed")).toBe("true");
    expect(buttons[3].attributes("aria-pressed")).toBe("false");
  });
});
