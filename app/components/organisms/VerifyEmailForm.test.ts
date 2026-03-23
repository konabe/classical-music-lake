import { describe, it, expect } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import VerifyEmailForm from "./VerifyEmailForm.vue";
import ErrorMessage from "../atoms/ErrorMessage.vue";
import ButtonPrimary from "../atoms/ButtonPrimary.vue";

describe("VerifyEmailForm", () => {
  const defaultProps = {
    email: "user@example.com",
    isLoading: false,
    error: "",
    infoMessage: "",
  };

  describe("表示", () => {
    it("メールアドレスが表示される", async () => {
      const wrapper = await mountSuspended(VerifyEmailForm, { props: defaultProps });
      expect(wrapper.text()).toContain("user@example.com");
    });

    it("認証コード入力フィールドが表示される", async () => {
      const wrapper = await mountSuspended(VerifyEmailForm, { props: defaultProps });
      expect(wrapper.find("input[type='text']").exists()).toBe(true);
    });

    it("「確認する」ボタンが表示される", async () => {
      const wrapper = await mountSuspended(VerifyEmailForm, {
        props: defaultProps,
        global: { components: { ButtonPrimary } },
      });
      expect(wrapper.find("button[type='submit']").text()).toBe("確認する");
    });

    it("「再送信」ボタンが表示される", async () => {
      const wrapper = await mountSuspended(VerifyEmailForm, { props: defaultProps });
      const buttons = wrapper.findAll("button");
      const resendButton = buttons.find((b) => b.text() === "再送信");
      expect(resendButton).toBeDefined();
    });

    it("error が空のときエラーメッセージが表示されない", async () => {
      const wrapper = await mountSuspended(VerifyEmailForm, { props: defaultProps });
      expect(wrapper.find("[data-testid='error-message']").exists()).toBe(false);
    });

    it("error があるときエラーメッセージが表示される", async () => {
      const wrapper = await mountSuspended(VerifyEmailForm, {
        props: { ...defaultProps, error: "認証コードが正しくありません" },
        global: { components: { ErrorMessage } },
      });
      expect(wrapper.text()).toContain("認証コードが正しくありません");
    });

    it("infoMessage があるとき案内メッセージが表示される", async () => {
      const wrapper = await mountSuspended(VerifyEmailForm, {
        props: { ...defaultProps, infoMessage: "認証コードを再送しました" },
      });
      expect(wrapper.text()).toContain("認証コードを再送しました");
    });

    it("isLoading が true のとき確認ボタンが無効化される", async () => {
      const wrapper = await mountSuspended(VerifyEmailForm, {
        props: { ...defaultProps, isLoading: true },
        global: { components: { ButtonPrimary } },
      });
      expect(wrapper.find("button[type='submit']").attributes("disabled")).toBeDefined();
    });
  });

  describe("イベント", () => {
    it("コードを入力して「確認する」を押すと submit イベントが発火する", async () => {
      const wrapper = await mountSuspended(VerifyEmailForm, { props: defaultProps });
      await wrapper.find("input[type='text']").setValue("123456");
      await wrapper.find("form").trigger("submit");
      expect(wrapper.emitted("submit")).toBeTruthy();
      expect(wrapper.emitted("submit")?.[0]).toEqual(["123456"]);
    });

    it("「再送信」ボタンを押すと resend イベントが発火する", async () => {
      const wrapper = await mountSuspended(VerifyEmailForm, { props: defaultProps });
      const buttons = wrapper.findAll("button");
      const resendButton = buttons.find((b) => b.text() === "再送信");
      await resendButton?.trigger("click");
      expect(wrapper.emitted("resend")).toBeTruthy();
    });
  });
});
