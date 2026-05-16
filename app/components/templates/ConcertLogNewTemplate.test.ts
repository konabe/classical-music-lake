import { mountSuspended } from "@nuxt/test-utils/runtime";
import ConcertLogNewTemplate from "@/components/templates/ConcertLogNewTemplate.vue";

describe("ConcertLogNewTemplate", () => {
  it("ページタイトルが表示される", async () => {
    const wrapper = await mountSuspended(ConcertLogNewTemplate, {
      props: { error: null },
    });
    expect(wrapper.text()).toContain("コンサート記録を追加");
  });

  it("error が null のときエラーメッセージが表示されない", async () => {
    const wrapper = await mountSuspended(ConcertLogNewTemplate, {
      props: { error: null },
    });
    expect(wrapper.find(".error-message").exists()).toBe(false);
  });

  it("error があるときエラーメッセージが表示される", async () => {
    const wrapper = await mountSuspended(ConcertLogNewTemplate, {
      props: { error: "作成に失敗しました。" },
    });
    expect(wrapper.text()).toContain("作成に失敗しました。");
  });
});
