import { describe, it, expect, vi, beforeEach } from "vitest";

import { handler } from "@/handlers/auth/resend-verification-code";
import { makeEvent, mockContext, mockCallback, describeInvalidBodyCases } from "@/test/fixtures";

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

const validInput = {
  email: "user@example.com",
};

describe("POST /auth/resend-verification-code", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describeInvalidBodyCases(handler, "/auth/resend-verification-code");

  describe("必須フィールド検証", () => {
    it("email が存在しない場合は 400 を返す", async () => {
      const result = await handler(
        makeEvent({
          body: JSON.stringify({}),
          httpMethod: "POST",
          path: "/auth/resend-verification-code",
        }),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(400);
    });

    it("email が無効な場合は 400 を返す", async () => {
      const result = await handler(
        makeEvent({
          body: JSON.stringify({ email: "invalid-email" }),
          httpMethod: "POST",
          path: "/auth/resend-verification-code",
        }),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toContain("email");
    });
  });

  describe("成功系", () => {
    it("有効な email で再送信に成功し、200 を返す", async () => {
      mockRepo.resendConfirmationCode.mockResolvedValueOnce();

      const result = await handler(
        makeEvent({
          body: JSON.stringify(validInput),
          httpMethod: "POST",
          path: "/auth/resend-verification-code",
        }),
        mockContext,
        mockCallback,
      );

      expect(result?.statusCode).toBe(200);
      const body = JSON.parse(result?.body ?? "{}");
      expect(body.message).toBeDefined();
      expect(mockRepo.resendConfirmationCode).toHaveBeenCalledWith(validInput.email);
    });
  });

  describe("Cognito エラー系", () => {
    it("既に確認済みのユーザーに再送信する場合は 400 を返す", async () => {
      const error = Object.assign(new Error("User is already confirmed"), {
        name: "InvalidParameterException",
      });
      mockRepo.resendConfirmationCode.mockRejectedValueOnce(error);

      const result = await handler(
        makeEvent({
          body: JSON.stringify(validInput),
          httpMethod: "POST",
          path: "/auth/resend-verification-code",
        }),
        mockContext,
        mockCallback,
      );

      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").error).toBe("UserAlreadyConfirmed");
    });

    it("ユーザーが存在しない場合は 400 を返す", async () => {
      const error = Object.assign(new Error("User does not exist"), {
        name: "UserNotFoundException",
      });
      mockRepo.resendConfirmationCode.mockRejectedValueOnce(error);

      const result = await handler(
        makeEvent({
          body: JSON.stringify(validInput),
          httpMethod: "POST",
          path: "/auth/resend-verification-code",
        }),
        mockContext,
        mockCallback,
      );

      expect(result?.statusCode).toBe(400);
    });

    it("リクエスト過多時に 429 を返す", async () => {
      const error = Object.assign(new Error("Too many requests"), {
        name: "TooManyRequestsException",
      });
      mockRepo.resendConfirmationCode.mockRejectedValueOnce(error);

      const result = await handler(
        makeEvent({
          body: JSON.stringify(validInput),
          httpMethod: "POST",
          path: "/auth/resend-verification-code",
        }),
        mockContext,
        mockCallback,
      );

      expect(result?.statusCode).toBe(429);
    });

    it("その他の Cognito エラー時に 500 を返す", async () => {
      const error = Object.assign(new Error("Service unavailable"), {
        name: "ServiceUnavailableException",
      });
      mockRepo.resendConfirmationCode.mockRejectedValueOnce(error);

      const result = await handler(
        makeEvent({
          body: JSON.stringify(validInput),
          httpMethod: "POST",
          path: "/auth/resend-verification-code",
        }),
        mockContext,
        mockCallback,
      );

      expect(result?.statusCode).toBe(500);
    });
  });
});
