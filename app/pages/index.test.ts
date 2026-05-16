import { mountSuspended } from "@nuxt/test-utils/runtime";
import IndexPage from "@/pages/index.vue";

describe("IndexPage", () => {
  it("楽曲を探すリンクが表示される", async () => {
    const wrapper = await mountSuspended(IndexPage);
    const link = wrapper.find('a[href="/pieces"]');
    expect(link.exists()).toBe(true);
  });

  it("鑑賞記録カードが表示される", async () => {
    const wrapper = await mountSuspended(IndexPage);
    expect(wrapper.find('a[href="/listening-logs"]').exists()).toBe(true);
  });
});
