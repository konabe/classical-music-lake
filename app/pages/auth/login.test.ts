import { describe, it, expect, vi, beforeEach } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import LoginPage from "./login.vue";

const mockLogin = vi.fn();

vi.mock("~/composables/useAuth", () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

beforeEach(() => {
  mockLogin.mockClear();
  sessionStorage.clear();
});

describe("LoginPage", () => {
  it("メール未確認エラー時に pendingPassword を sessionStorage に保存する", async () => {
    mockLogin.mockResolvedValue({ success: false, errorType: "not_confirmed" });

    const wrapper = await mountSuspended(LoginPage);
    const vm = wrapper.vm as { handleSubmit: (email: string, password: string) => Promise<void> };
    await vm.handleSubmit("user@example.com", "TestPassword1");

    expect(sessionStorage.getItem("pendingPassword")).toBe("TestPassword1");
  });

  it("メール未確認エラー時に /auth/verify-email へリダイレクトする", async () => {
    mockLogin.mockResolvedValue({ success: false, errorType: "not_confirmed" });

    const wrapper = await mountSuspended(LoginPage);
    const pushSpy = vi.spyOn(wrapper.vm.$router, "push");
    const vm = wrapper.vm as { handleSubmit: (email: string, password: string) => Promise<void> };
    await vm.handleSubmit("user@example.com", "TestPassword1");

    expect(pushSpy).toHaveBeenCalledWith("/auth/verify-email", {
      state: { email: "user@example.com" },
    });
  });

  it("ログイン成功時は / へリダイレクトする", async () => {
    mockLogin.mockResolvedValue({ success: true });

    const wrapper = await mountSuspended(LoginPage);
    const pushSpy = vi.spyOn(wrapper.vm.$router, "push");
    const vm = wrapper.vm as { handleSubmit: (email: string, password: string) => Promise<void> };
    await vm.handleSubmit("user@example.com", "TestPassword1");

    expect(pushSpy).toHaveBeenCalledWith("/");
    expect(sessionStorage.getItem("pendingPassword")).toBeNull();
  });
});
