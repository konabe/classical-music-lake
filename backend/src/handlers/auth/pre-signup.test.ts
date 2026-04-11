import type { PreSignUpTriggerEvent } from "aws-lambda";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { handler } from "./pre-signup";
import * as linkExternalProviderModule from "../../usecases/auth/link-external-provider";

vi.mock("../../usecases/auth/link-external-provider", () => ({
  linkExternalProvider: vi.fn(),
}));

const makeEvent = (overrides: Partial<PreSignUpTriggerEvent> = {}): PreSignUpTriggerEvent =>
  ({
    triggerSource: "PreSignUp_ExternalProvider",
    userName: "google_100749370741417953110",
    userPoolId: "ap-northeast-1_testPoolId",
    request: {
      userAttributes: {
        email: "user@example.com",
      },
    },
    response: {},
    ...overrides,
  }) as PreSignUpTriggerEvent;

describe("pre-signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("スキップ条件", () => {
    it("triggerSource が PreSignUp_ExternalProvider 以外のときは usecase を呼ばずに event を返す", async () => {
      const event = makeEvent({ triggerSource: "PreSignUp_SignUp" as never });
      const result = await handler(event, {} as never, {} as never);
      expect(result).toEqual(event);
      expect(linkExternalProviderModule.linkExternalProvider).not.toHaveBeenCalled();
    });

    it("email が空のときは usecase を呼ばずに event を返す", async () => {
      const event = makeEvent({
        request: { userAttributes: { email: "" } } as never,
      });
      const result = await handler(event, {} as never, {} as never);
      expect(result).toEqual(event);
      expect(linkExternalProviderModule.linkExternalProvider).not.toHaveBeenCalled();
    });
  });

  describe("アカウントリンク", () => {
    it("外部プロバイダーサインアップ時に linkExternalProvider を呼ぶ", async () => {
      vi.mocked(linkExternalProviderModule.linkExternalProvider).mockResolvedValueOnce(true);

      const event = makeEvent({ userName: "google_100749370741417953110" });
      const result = await handler(event, {} as never, {} as never);

      expect(result).toEqual(event);
      expect(linkExternalProviderModule.linkExternalProvider).toHaveBeenCalledWith(
        "ap-northeast-1_testPoolId",
        "user@example.com",
        "google_100749370741417953110"
      );
    });

    it("linkExternalProvider が失敗した場合はエラーを伝播する", async () => {
      vi.mocked(linkExternalProviderModule.linkExternalProvider).mockRejectedValueOnce(
        new Error("SourceProviderName must match a Provider that is configured for the User Pool")
      );

      const event = makeEvent({ userName: "google_100749370741417953110" });
      await expect(handler(event, {} as never, {} as never)).rejects.toThrow();
    });
  });
});
