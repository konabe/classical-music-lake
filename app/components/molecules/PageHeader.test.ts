import { mountSuspended } from "@nuxt/test-utils/runtime";
import PageHeader from "./PageHeader.vue";
import ButtonPrimary from "../atoms/ButtonPrimary.vue";

vi.mock("~/composables/useAuth", () => ({
  ACCESS_TOKEN_KEY: "accessToken",
  useAuth: () => ({
    isAuthenticated: () => false,
    isTokenExpired: () => false,
    refreshTokens: () => Promise.resolve(false),
    clearTokens: () => {},
  }),
}));

describe("PageHeader", () => {
  it("title が h1 に表示される", async () => {
    const wrapper = await mountSuspended(PageHeader, {
      props: { title: "鑑賞記録", newPagePath: "/listening-logs/new" },
    });
    expect(wrapper.find("h1").text()).toBe("鑑賞記録");
  });

  it("page-header クラスが存在する", async () => {
    const wrapper = await mountSuspended(PageHeader, {
      props: { title: "鑑賞記録", newPagePath: "/listening-logs/new" },
    });
    expect(wrapper.find(".page-header").exists()).toBe(true);
  });

  it("スロットのコンテンツが表示される", async () => {
    const wrapper = await mountSuspended(PageHeader, {
      props: { title: "楽曲マスタ", newPagePath: "/pieces/new" },
      slots: { default: "+ 新しい楽曲" },
      global: { components: { ButtonPrimary } },
    });
    expect(wrapper.text()).toContain("+ 新しい楽曲");
  });

  it("ボタンクリックで newPagePath に遷移する", async () => {
    const wrapper = await mountSuspended(PageHeader, {
      props: { title: "鑑賞記録", newPagePath: "/listening-logs/new" },
      global: { components: { ButtonPrimary } },
    });
    const pushSpy = vi.spyOn(wrapper.vm.$router, "push");
    await wrapper.find("button").trigger("click");
    expect(pushSpy).toHaveBeenCalledWith("/listening-logs/new");
  });

  it("newPagePath が未指定のときボタンが表示されない", async () => {
    const wrapper = await mountSuspended(PageHeader, {
      props: { title: "楽曲マスタ" },
    });
    expect(wrapper.find("button").exists()).toBe(false);
  });
});
