import { mountSuspended } from "@nuxt/test-utils/runtime";
import CallbackPage from "./callback.vue";

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
      mockHandleOAuthCallback.mockResolvedValue(undefined);

      await mountSuspended(CallbackPage, {
        route: "/auth/callback?code=test-auth-code",
      });

      expect(mockHandleOAuthCallback).toHaveBeenCalledWith("test-auth-code");
    });

    it("成功時に / へリダイレクトする", async () => {
      // handleOAuthCallback を pending にして spy セットアップ後に解決させる
      let resolveCallback!: () => void;
      mockHandleOAuthCallback.mockReturnValue(
        new Promise<void>((resolve) => {
          resolveCallback = resolve;
        })
      );

      const wrapper = await mountSuspended(CallbackPage, {
        route: "/auth/callback?code=test-auth-code",
      });
      const pushSpy = vi.spyOn(wrapper.vm.$router, "push");

      resolveCallback();
      await wrapper.vm.$nextTick();

      expect(pushSpy).toHaveBeenCalledWith("/");
    });

    it("handleOAuthCallback が失敗したときエラーメッセージを表示する", async () => {
      mockHandleOAuthCallback.mockRejectedValue(new Error("Token exchange failed"));

      const wrapper = await mountSuspended(CallbackPage, {
        route: "/auth/callback?code=bad-code",
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain("ログインに失敗しました");
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
