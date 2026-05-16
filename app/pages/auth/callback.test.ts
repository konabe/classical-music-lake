import { mountSuspended } from "@nuxt/test-utils/runtime";
import CallbackPage from "@/pages/auth/callback.vue";

const mockHandleOAuthCallback = vi.fn();

vi.mock("~/composables/useAuth", () => ({
  useAuth: () => ({
    handleOAuthCallback: mockHandleOAuthCallback,
  }),
}));

beforeEach(() => {
  mockHandleOAuthCallback.mockClear();
});

describe("CallbackPage", () => {
  describe("code がある場合", () => {
    it("handleOAuthCallback を code 付きで呼び出す", async () => {
      mockHandleOAuthCallback.mockResolvedValue({ success: true });

      await mountSuspended(CallbackPage, {
        route: "/auth/callback?code=test-auth-code",
      });

      expect(mockHandleOAuthCallback).toHaveBeenCalledWith("test-auth-code");
    });

    it("成功時に / へリダイレクトする", async () => {
      // handleOAuthCallback を pending にして spy セットアップ後に解決させる
      let resolveCallback!: (value: { success: boolean }) => void;
      mockHandleOAuthCallback.mockReturnValue(
        new Promise<{ success: boolean }>((resolve) => {
          resolveCallback = resolve;
        }),
      );

      const wrapper = await mountSuspended(CallbackPage, {
        route: "/auth/callback?code=test-auth-code",
      });
      const pushSpy = vi.spyOn(wrapper.vm.$router, "push");

      resolveCallback({ success: true });
      await wrapper.vm.$nextTick();

      expect(pushSpy).toHaveBeenCalledWith("/");
    });

    it("handleOAuthCallback が失敗したときエラーメッセージを表示する", async () => {
      mockHandleOAuthCallback.mockResolvedValue({
        success: false,
        error: "Token exchange failed",
      });

      const wrapper = await mountSuspended(CallbackPage, {
        route: "/auth/callback?code=bad-code",
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain("ログインに失敗しました");
    });
  });

  describe("Cognito がエラーを返した場合", () => {
    it("error_description をエラーメッセージに含めて表示する", async () => {
      const wrapper = await mountSuspended(CallbackPage, {
        route: "/auth/callback?error=access_denied&error_description=Login+option+is+not+available",
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain("ログインに失敗しました");
      expect(wrapper.text()).toContain("Login option is not available");
    });

    it("error_description がない場合は汎用メッセージを表示する", async () => {
      const wrapper = await mountSuspended(CallbackPage, {
        route: "/auth/callback?error=access_denied",
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain("ログインに失敗しました");
    });

    it("handleOAuthCallback を呼び出さない", async () => {
      await mountSuspended(CallbackPage, {
        route: "/auth/callback?error=access_denied&error_description=some+error",
      });

      expect(mockHandleOAuthCallback).not.toHaveBeenCalled();
    });
  });

  describe("code がない場合", () => {
    it("エラーメッセージを表示する", async () => {
      const wrapper = await mountSuspended(CallbackPage, {
        route: "/auth/callback",
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain("ログインに失敗しました");
    });

    it("handleOAuthCallback を呼び出さない", async () => {
      await mountSuspended(CallbackPage, {
        route: "/auth/callback",
      });

      expect(mockHandleOAuthCallback).not.toHaveBeenCalled();
    });
  });
});
