import { mountSuspended } from "@nuxt/test-utils/runtime";
import ComposersTemplate from "./ComposersTemplate.vue";

describe("ComposersTemplate", () => {
  it("管理者の場合 '+ 新しい作曲家' リンクが表示される", async () => {
    const wrapper = await mountSuspended(ComposersTemplate, {
      props: { composers: [], error: null, pending: false, hasMore: false, isAdmin: true },
    });
    expect(wrapper.text()).toContain("新しい作曲家");
  });

  it("非管理者の場合 '+ 新しい作曲家' リンクが表示されない", async () => {
    const wrapper = await mountSuspended(ComposersTemplate, {
      props: { composers: [], error: null, pending: false, hasMore: false, isAdmin: false },
    });
    expect(wrapper.find("a[href='/composers/new']").exists()).toBe(false);
  });

  it("タイトルが '作曲家' と表示される", async () => {
    const wrapper = await mountSuspended(ComposersTemplate, {
      props: { composers: [], error: null, pending: false, hasMore: false, isAdmin: true },
    });
    expect(wrapper.find("h1.masthead-title").text()).toContain("作曲家");
  });
});
