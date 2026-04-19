import { mountSuspended } from "@nuxt/test-utils/runtime";
import ComposerNewTemplate from "./ComposerNewTemplate.vue";

describe("ComposerNewTemplate", () => {
  it("タイトルが表示される", async () => {
    const wrapper = await mountSuspended(ComposerNewTemplate, {
      props: { errorMessage: "" },
    });
    expect(wrapper.text()).toContain("作曲家を追加");
  });

  it("errorMessage が渡されるとエラーメッセージが表示される", async () => {
    const wrapper = await mountSuspended(ComposerNewTemplate, {
      props: { errorMessage: "登録に失敗しました" },
    });
    expect(wrapper.text()).toContain("登録に失敗しました");
  });

  it("errorMessage が空文字列のときはエラーメッセージを表示しない", async () => {
    const wrapper = await mountSuspended(ComposerNewTemplate, {
      props: { errorMessage: "" },
    });
    expect(wrapper.find(".error-message").exists()).toBe(false);
  });
});
