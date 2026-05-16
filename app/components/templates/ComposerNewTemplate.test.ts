import { mountSuspended } from "@nuxt/test-utils/runtime";
import ComposerNewTemplate from "@/components/templates/ComposerNewTemplate.vue";

describe("ComposerNewTemplate", () => {
  it("タイトルが表示される", async () => {
    const wrapper = await mountSuspended(ComposerNewTemplate, {
      props: { error: null },
    });
    expect(wrapper.text()).toContain("作曲家を追加");
  });

  it("error が渡されるとエラーメッセージが表示される", async () => {
    const wrapper = await mountSuspended(ComposerNewTemplate, {
      props: { error: "登録に失敗しました" },
    });
    expect(wrapper.text()).toContain("登録に失敗しました");
  });

  it("error が null のときはエラーメッセージを表示しない", async () => {
    const wrapper = await mountSuspended(ComposerNewTemplate, {
      props: { error: null },
    });
    expect(wrapper.find(".error-message").exists()).toBe(false);
  });
});
