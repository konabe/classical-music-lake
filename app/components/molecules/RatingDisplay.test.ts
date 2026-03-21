import { describe, it, expect } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import RatingDisplay from "./RatingDisplay.vue";

describe("RatingDisplay", () => {
  it("評価5のとき★5つが表示される", async () => {
    const wrapper = await mountSuspended(RatingDisplay, { props: { rating: 5 } });
    expect(wrapper.text()).toBe("★★★★★");
  });

  it("評価3のとき★3つと☆2つが表示される", async () => {
    const wrapper = await mountSuspended(RatingDisplay, { props: { rating: 3 } });
    expect(wrapper.text()).toBe("★★★☆☆");
  });

  it("評価0のとき☆5つが表示される", async () => {
    const wrapper = await mountSuspended(RatingDisplay, { props: { rating: 0 } });
    expect(wrapper.text()).toBe("☆☆☆☆☆");
  });

  it("rating クラスが付与されている", async () => {
    const wrapper = await mountSuspended(RatingDisplay, { props: { rating: 3 } });
    expect(wrapper.find(".rating").exists()).toBe(true);
  });
});
