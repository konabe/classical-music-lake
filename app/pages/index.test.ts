import { mountSuspended } from "@nuxt/test-utils/runtime";
import IndexPage from "./index.vue";

describe("IndexPage", () => {
  it("管理者向けリンクセクションが表示される", async () => {
    const wrapper = await mountSuspended(IndexPage);
    expect(wrapper.find("section.admin-links").exists()).toBe(true);
  });

  it("楽曲マスタへのリンクが表示される", async () => {
    const wrapper = await mountSuspended(IndexPage);
    const link = wrapper.find('a[href="/pieces"]');
    expect(link.exists()).toBe(true);
    expect(link.text()).toBe("楽曲マスタ");
  });

  it("鑑賞記録カードが引き続き表示される", async () => {
    const wrapper = await mountSuspended(IndexPage);
    expect(wrapper.find('a[href="/listening-logs"]').exists()).toBe(true);
  });
});
