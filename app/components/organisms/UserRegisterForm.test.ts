import { mountSuspended } from "@nuxt/test-utils/runtime";
import UserRegisterForm from "./UserRegisterForm.vue";

const defaultErrors = { email: "", password: "" };

describe("UserRegisterForm", () => {
  describe("表示", () => {
    it("フォームが表示される", async () => {
      const wrapper = await mountSuspended(UserRegisterForm, {
        props: { isLoading: false, errors: defaultErrors, successMessage: "" },
      });
      expect(wrapper.find("form").exists()).toBe(true);
    });

    it("メールアドレス入力欄が表示される", async () => {
      const wrapper = await mountSuspended(UserRegisterForm, {
        props: { isLoading: false, errors: defaultErrors, successMessage: "" },
      });
      expect(wrapper.find('input[type="email"]').exists()).toBe(true);
    });

    it("パスワード入力欄が表示される", async () => {
      const wrapper = await mountSuspended(UserRegisterForm, {
        props: { isLoading: false, errors: defaultErrors, successMessage: "" },
      });
      expect(wrapper.find('input[type="password"]').exists()).toBe(true);
    });

    it("isLoading=false のとき「登録」ボタンが表示される", async () => {
      const wrapper = await mountSuspended(UserRegisterForm, {
        props: { isLoading: false, errors: defaultErrors, successMessage: "" },
      });
      expect(wrapper.find("button[type='submit']").text()).toBe("登録");
    });

    it("isLoading=true のとき「登録中...」ボタンが表示される", async () => {
      const wrapper = await mountSuspended(UserRegisterForm, {
        props: { isLoading: true, errors: defaultErrors, successMessage: "" },
      });
      expect(wrapper.find("button[type='submit']").text()).toBe("登録中...");
    });

    it("successMessage が設定されているとき表示される", async () => {
      const wrapper = await mountSuspended(UserRegisterForm, {
        props: {
          isLoading: false,
          errors: defaultErrors,
          successMessage: "登録が完了しました",
        },
      });
      expect(wrapper.find(".success-message").exists()).toBe(true);
      expect(wrapper.text()).toContain("登録が完了しました");
    });

    it("successMessage が空のとき成功メッセージが表示されない", async () => {
      const wrapper = await mountSuspended(UserRegisterForm, {
        props: { isLoading: false, errors: defaultErrors, successMessage: "" },
      });
      expect(wrapper.find(".success-message").exists()).toBe(false);
    });

    it("ログインリンクが表示される", async () => {
      const wrapper = await mountSuspended(UserRegisterForm, {
        props: { isLoading: false, errors: defaultErrors, successMessage: "" },
      });
      expect(wrapper.find('a[href="/auth/login"]').exists()).toBe(true);
    });

    it("メール・パスワード両方の FormGroup に必須マークが表示される", async () => {
      const wrapper = await mountSuspended(UserRegisterForm, {
        props: { isLoading: false, errors: defaultErrors, successMessage: "" },
      });
      const requiredMarks = wrapper.findAllComponents({ name: "RequiredMark" });
      expect(requiredMarks).toHaveLength(2);
    });
  });

  describe("イベント", () => {
    it("フォーム送信時に submit イベントが emit される", async () => {
      const wrapper = await mountSuspended(UserRegisterForm, {
        props: { isLoading: false, errors: defaultErrors, successMessage: "" },
      });
      await wrapper.find('input[type="email"]').setValue("user@example.com");
      await wrapper.find('input[type="password"]').setValue("SecurePass1");
      await wrapper.find("form").trigger("submit.prevent");
      expect(wrapper.emitted("submit")).toBeDefined();
    });

    it("submit イベントにメールとパスワードが含まれる", async () => {
      const wrapper = await mountSuspended(UserRegisterForm, {
        props: { isLoading: false, errors: defaultErrors, successMessage: "" },
      });
      await wrapper.find('input[type="email"]').setValue("user@example.com");
      await wrapper.find('input[type="password"]').setValue("SecurePass1");
      await wrapper.find("form").trigger("submit.prevent");
      const emitted = wrapper.emitted("submit") as [string, string][];
      expect(emitted[0][0]).toBe("user@example.com");
      expect(emitted[0][1]).toBe("SecurePass1");
    });
  });
});
