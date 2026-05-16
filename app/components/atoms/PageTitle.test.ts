import { mountSuspended } from "@nuxt/test-utils/runtime";
import PageTitle from "@/components/atoms/PageTitle.vue";

describe("PageTitle", () => {
  it("スロットのテキストが表示される", async () => {
    const wrapper = await mountSuspended(PageTitle, {
      slots: { default: "作曲家を追加" },
    });
    expect(wrapper.text()).toBe("作曲家を追加");
  });

  it("page-title クラスが存在する", async () => {
    const wrapper = await mountSuspended(PageTitle, {
      slots: { default: "タイトル" },
    });
    expect(wrapper.find(".page-title").exists()).toBe(true);
  });

  it("h1 要素を含む", async () => {
    const wrapper = await mountSuspended(PageTitle, {
      slots: { default: "タイトル" },
    });
    expect(wrapper.find("h1.page-title").exists()).toBe(true);
  });
});
