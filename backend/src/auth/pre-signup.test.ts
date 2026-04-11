import type { PreSignUpTriggerEvent } from "aws-lambda";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { handler } from "./pre-signup";

const { mockSend } = vi.hoisted(() => ({
  mockSend: vi.fn(),
}));

vi.mock("@aws-sdk/client-cognito-identity-provider", () => ({
  CognitoIdentityProviderClient: vi.fn(function (this: Record<string, unknown>) {
    this.send = mockSend;
  }),
  ListUsersCommand: vi.fn(function (this: Record<string, unknown>, input: unknown) {
    this.input = input;
  }),
  AdminLinkProviderForUserCommand: vi.fn(function (this: Record<string, unknown>, input: unknown) {
    this.input = input;
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
    it("triggerSource が PreSignUp_ExternalProvider 以外のときは Cognito を呼ばずに event を返す", async () => {
      const event = makeEvent({ triggerSource: "PreSignUp_SignUp" as never });
      const result = await handler(event, {} as never, {} as never);
      expect(result.response.autoConfirmUser).toBeUndefined();
      expect(result.response.autoVerifyEmail).toBeUndefined();
      expect(mockSend).not.toHaveBeenCalled();
    });

    it("email が空のときは Cognito を呼ばずに event を返す", async () => {
      const event = makeEvent({
        request: { userAttributes: { email: "" } } as never,
      });
      const result = await handler(event, {} as never, {} as never);
      expect(result.response.autoConfirmUser).toBeUndefined();
      expect(result.response.autoVerifyEmail).toBeUndefined();
      expect(mockSend).not.toHaveBeenCalled();
    });

    it("同一メールの既存ユーザーがいないときは AdminLinkProviderForUser を呼ばずに event を返す", async () => {
      mockSend.mockResolvedValue({ Users: [] });
      const event = makeEvent();
      const result = await handler(event, {} as never, {} as never);
      expect(result.response.autoConfirmUser).toBeUndefined();
      expect(result.response.autoVerifyEmail).toBeUndefined();
      expect(mockSend).toHaveBeenCalledTimes(1); // ListUsers のみ
    });

    it("既存ユーザーが UNCONFIRMED のときは AdminLinkProviderForUser を呼ばずに event を返す", async () => {
      mockSend.mockResolvedValue({
        Users: [{ Username: "user@example.com", UserStatus: "UNCONFIRMED" }],
      });
      const event = makeEvent();
      const result = await handler(event, {} as never, {} as never);
      expect(result.response.autoConfirmUser).toBeUndefined();
      expect(result.response.autoVerifyEmail).toBeUndefined();
      expect(mockSend).toHaveBeenCalledTimes(1);
    });
  });

  describe("アカウントリンク", () => {
    it("event.userName が 'google_<sub>' のとき ProviderName: 'Google' で AdminLinkProviderForUser を呼ぶ", async () => {
      mockSend
        .mockResolvedValueOnce({
          Users: [
            {
              Username: "17b44a18-0001-70d9-4e8e-ae36f680df10",
              UserStatus: "CONFIRMED",
            },
          ],
        })
        .mockResolvedValueOnce({});

      const event = makeEvent({ userName: "google_100749370741417953110" });
      const result = await handler(event, {} as never, {} as never);

      expect(result.response.autoConfirmUser).toBe(true);
      expect(result.response.autoVerifyEmail).toBe(true);
      expect(mockSend).toHaveBeenCalledTimes(2);

      const linkCall = mockSend.mock.calls[1][0];
      expect(linkCall.input.SourceUser.ProviderName).toBe("Google");
      expect(linkCall.input.SourceUser.ProviderAttributeValue).toBe("100749370741417953110");
      expect(linkCall.input.DestinationUser.ProviderName).toBe("Cognito");
      expect(linkCall.input.DestinationUser.ProviderAttributeValue).toBe(
        "17b44a18-0001-70d9-4e8e-ae36f680df10"
      );
    });

    it("AdminLinkProviderForUser が失敗した場合はエラーを伝播する", async () => {
      mockSend
        .mockResolvedValueOnce({
          Users: [
            {
              Username: "17b44a18-0001-70d9-4e8e-ae36f680df10",
              UserStatus: "CONFIRMED",
            },
          ],
        })
        .mockRejectedValueOnce(
          new Error("SourceProviderName must match a Provider that is configured for the User Pool")
        );

      const event = makeEvent({ userName: "google_100749370741417953110" });
      await expect(handler(event, {} as never, {} as never)).rejects.toThrow();
    });
  });
});
