import type { PreSignUpTriggerEvent } from "aws-lambda";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { handler } from "./pre-signup";

const mockRepo = vi.hoisted(() => ({
  signUp: vi.fn(),
  initiateAuth: vi.fn(),
  confirmSignUp: vi.fn(),
  resendConfirmationCode: vi.fn(),
  refreshToken: vi.fn(),
  listUsersByEmail: vi.fn(),
  linkProviderForUser: vi.fn(),
}));

vi.mock("../../repositories/cognito-auth-repository", () => ({
  CognitoAuthRepository: vi.fn().mockImplementation(function () {
    return mockRepo;
  }),
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
      expect(mockRepo.listUsersByEmail).not.toHaveBeenCalled();
    });

    it("email が空のときは usecase を呼ばずに event を返す", async () => {
      const event = makeEvent({
        request: { userAttributes: { email: "" } } as never,
      });
      const result = await handler(event, {} as never, {} as never);
      expect(result).toEqual(event);
      expect(mockRepo.listUsersByEmail).not.toHaveBeenCalled();
    });
  });

  describe("アカウントリンク", () => {
    it("外部プロバイダーサインアップ時に linkProviderForUser を呼ぶ", async () => {
      mockRepo.listUsersByEmail.mockResolvedValueOnce([
        { username: "existing-user", status: "CONFIRMED" },
      ]);
      mockRepo.linkProviderForUser.mockResolvedValueOnce(undefined);

      const event = makeEvent({ userName: "google_100749370741417953110" });
      const result = await handler(event, {} as never, {} as never);

      expect(result).toEqual(event);
      expect(mockRepo.listUsersByEmail).toHaveBeenCalledWith(
        "ap-northeast-1_testPoolId",
        "user@example.com",
      );
      expect(mockRepo.linkProviderForUser).toHaveBeenCalledWith(
        "ap-northeast-1_testPoolId",
        "existing-user",
        "Google",
        "100749370741417953110",
      );
    });

    it("linkProviderForUser が失敗した場合はエラーを伝播する", async () => {
      mockRepo.listUsersByEmail.mockResolvedValueOnce([
        { username: "existing-user", status: "CONFIRMED" },
      ]);
      mockRepo.linkProviderForUser.mockRejectedValueOnce(
        new Error("SourceProviderName must match a Provider that is configured for the User Pool"),
      );

      const event = makeEvent({ userName: "google_100749370741417953110" });
      await expect(handler(event, {} as never, {} as never)).rejects.toThrow();
    });
  });
});
