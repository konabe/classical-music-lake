import { mountSuspended } from "@nuxt/test-utils/runtime";
import AuthFormContainer from "./AuthFormContainer.vue";

describe("AuthFormContainer", () => {
  it("title が h1 に表示される", async () => {
    const wrapper = await mountSuspended(AuthFormContainer, {
      props: { title: "ログイン" },
    });
    expect(wrapper.find("h1").text()).toBe("ログイン");
  });

  it("auth-form-container クラスが存在する", async () => {
    const wrapper = await mountSuspended(AuthFormContainer, {
      props: { title: "ログイン" },
    });
    expect(wrapper.find(".auth-form-container").exists()).toBe(true);
  });

  it("スロットのコンテンツが表示される", async () => {
    const wrapper = await mountSuspended(AuthFormContainer, {
      props: { title: "新規登録" },
      slots: { default: "<p>フォームの内容</p>" },
    });
    expect(wrapper.text()).toContain("フォームの内容");
  });

  it("異なる title を渡すと正しく表示される", async () => {
    const wrapper = await mountSuspended(AuthFormContainer, {
      props: { title: "メールアドレス確認" },
    });
    expect(wrapper.find("h1").text()).toBe("メールアドレス確認");
  });
});
