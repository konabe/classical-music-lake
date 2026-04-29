import { mountSuspended } from "@nuxt/test-utils/runtime";
import LoginForm from "./LoginForm.vue";

const defaultErrors = { email: "", password: "", general: "" };

describe("LoginForm", () => {
  describe("表示", () => {
    it("フォームが表示される", async () => {
      const wrapper = await mountSuspended(LoginForm, {
        props: { isLoading: false, errors: defaultErrors },
      });
      expect(wrapper.find("form").exists()).toBe(true);
    });

    it("メールアドレス入力欄が表示される", async () => {
      const wrapper = await mountSuspended(LoginForm, {
        props: { isLoading: false, errors: defaultErrors },
      });
      expect(wrapper.find('input[type="email"]').exists()).toBe(true);
    });

    it("パスワード入力欄が表示される", async () => {
      const wrapper = await mountSuspended(LoginForm, {
        props: { isLoading: false, errors: defaultErrors },
      });
      expect(wrapper.find('input[type="password"]').exists()).toBe(true);
    });

    it("isLoading=false のとき「ログイン」ボタンが表示される", async () => {
      const wrapper = await mountSuspended(LoginForm, {
        props: { isLoading: false, errors: defaultErrors },
      });
      expect(wrapper.find("button[type='submit']").text()).toBe("ログイン");
    });

    it("isLoading=true のとき「ログイン中...」ボタンが表示される", async () => {
      const wrapper = await mountSuspended(LoginForm, {
        props: { isLoading: true, errors: defaultErrors },
      });
      expect(wrapper.find("button[type='submit']").text()).toBe("ログイン中...");
    });

    it("isLoading=true のとき送信ボタンが disabled になる", async () => {
      const wrapper = await mountSuspended(LoginForm, {
        props: { isLoading: true, errors: defaultErrors },
      });
      expect(wrapper.find("button[type='submit']").attributes("disabled")).toBeDefined();
    });

    it("general エラーが表示される", async () => {
      const wrapper = await mountSuspended(LoginForm, {
        props: {
          isLoading: false,
          errors: { ...defaultErrors, general: "ログインに失敗しました" },
        },
      });
      expect(wrapper.text()).toContain("ログインに失敗しました");
    });

    it("新規登録リンクが表示される", async () => {
      const wrapper = await mountSuspended(LoginForm, {
        props: { isLoading: false, errors: defaultErrors },
      });
      expect(wrapper.find('a[href="/auth/user-register"]').exists()).toBe(true);
    });

    it("Googleでログインボタンが表示される", async () => {
      const wrapper = await mountSuspended(LoginForm, {
        props: { isLoading: false, errors: defaultErrors },
      });
      expect(wrapper.find(".btn-google-login").exists()).toBe(true);
    });

    it("メール・パスワード両方の FormGroup に必須マークが表示される", async () => {
      const wrapper = await mountSuspended(LoginForm, {
        props: { isLoading: false, errors: defaultErrors },
      });
      const requiredMarks = wrapper.findAll('[aria-label="必須"]');
      expect(requiredMarks).toHaveLength(2);
    });
  });

  describe("イベント", () => {
    it("フォーム送信時に submit イベントが emit される", async () => {
      const wrapper = await mountSuspended(LoginForm, {
        props: { isLoading: false, errors: defaultErrors },
      });
      const emailInput = wrapper.find('input[type="email"]');
      const passwordInput = wrapper.find('input[type="password"]');
      await emailInput.setValue("user@example.com");
      await passwordInput.setValue("password123");
      await wrapper.find("form").trigger("submit.prevent");
      expect(wrapper.emitted("submit")).toBeDefined();
    });

    it("submit イベントにメールとパスワードが含まれる", async () => {
      const wrapper = await mountSuspended(LoginForm, {
        props: { isLoading: false, errors: defaultErrors },
      });
      await wrapper.find('input[type="email"]').setValue("user@example.com");
      await wrapper.find('input[type="password"]').setValue("MyPassword1");
      await wrapper.find("form").trigger("submit.prevent");
      const emitted = wrapper.emitted("submit") as [string, string][];
      expect(emitted[0][0]).toBe("user@example.com");
      expect(emitted[0][1]).toBe("MyPassword1");
    });

    it("Googleでログインボタンをクリックすると googleLogin イベントが emit される", async () => {
      const wrapper = await mountSuspended(LoginForm, {
        props: { isLoading: false, errors: defaultErrors },
      });
      await wrapper.find(".btn-google-login").trigger("click");
      expect(wrapper.emitted("googleLogin")).toBeDefined();
    });
  });
});
