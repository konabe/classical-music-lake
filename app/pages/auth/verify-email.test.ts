import { mountSuspended } from "@nuxt/test-utils/runtime";
import VerifyEmailPage from "./verify-email.vue";

const mockVerifyEmail = vi.fn();
const mockResendVerificationCode = vi.fn();
const mockLogin = vi.fn();

vi.mock("~/composables/useAuth", () => {
  return {
    useAuth: () => {
      return {
        verifyEmail: mockVerifyEmail,
        resendVerificationCode: mockResendVerificationCode,
        login: mockLogin,
      };
    },
  };
});

beforeEach(() => {
  mockVerifyEmail.mockClear();
  mockResendVerificationCode.mockClear();
  mockLogin.mockClear();
  sessionStorage.clear();
  history.replaceState({ email: "user@example.com" }, "");
  sessionStorage.setItem("pendingPassword", "SecurePass1");
});

describe("VerifyEmailPage", () => {
  it("認証成功・ログイン成功後に / へリダイレクトする", async () => {
    mockVerifyEmail.mockResolvedValue({ success: true });
    mockLogin.mockResolvedValue({ success: true });

    const wrapper = await mountSuspended(VerifyEmailPage);
    const pushSpy = vi.spyOn(wrapper.vm.$router, "push");
    const vm = wrapper.vm as { handleSubmit: (code: string) => Promise<void> };
    await vm.handleSubmit("123456");

    expect(pushSpy).toHaveBeenCalledWith("/");
  });

  it("認証失敗時はエラーメッセージを設定する", async () => {
    mockVerifyEmail.mockResolvedValue({ success: false, error: "コードが間違っています" });

    const wrapper = await mountSuspended(VerifyEmailPage);
    const vm = wrapper.vm as {
      handleSubmit: (code: string) => Promise<void>;
      error: string;
    };
    await vm.handleSubmit("000000");

    expect(vm.error).toBe("コードが間違っています");
  });

  it("認証成功後にログイン失敗した場合はエラーメッセージを設定する", async () => {
    mockVerifyEmail.mockResolvedValue({ success: true });
    mockLogin.mockResolvedValue({ success: false });

    const wrapper = await mountSuspended(VerifyEmailPage);
    const vm = wrapper.vm as {
      handleSubmit: (code: string) => Promise<void>;
      error: string;
    };
    await vm.handleSubmit("123456");

    expect(vm.error).toContain("ログインに失敗しました");
  });

  it("再送信成功時に infoMessage を設定する", async () => {
    mockResendVerificationCode.mockResolvedValue({ success: true });

    const wrapper = await mountSuspended(VerifyEmailPage);
    const vm = wrapper.vm as {
      handleResend: () => Promise<void>;
      infoMessage: string;
    };
    await vm.handleResend();

    expect(vm.infoMessage).toContain("再送しました");
  });

  it("再送信失敗時にエラーメッセージを設定する", async () => {
    mockResendVerificationCode.mockResolvedValue({ success: false, error: "再送信に失敗" });

    const wrapper = await mountSuspended(VerifyEmailPage);
    const vm = wrapper.vm as {
      handleResend: () => Promise<void>;
      error: string;
    };
    await vm.handleResend();

    expect(vm.error).toBe("再送信に失敗");
  });
});
