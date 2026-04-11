import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Context } from "aws-lambda";

import { handler } from "./resend-verification-code";
import { makeEvent } from "../../test/fixtures";

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

const mockContext = {} as Context;
const mockCallback = { signal: new AbortController().signal };

const validInput = {
  email: "user@example.com",
};

describe("POST /auth/resend-verification-code", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("リクエストボディ異常系", () => {
    it.each<[string | null, number, string]>([
      [null, 400, "Request body is required"],
      ["null", 400, "Request body is required"],
      ["[]", 400, "Request body must be a JSON object"],
      ["invalid json", 422, "Invalid or malformed JSON was provided"],
    ])("body=%j のとき %i を返す", async (body, statusCode, message) => {
      const result = await handler(
        makeEvent({ body, httpMethod: "POST", path: "/auth/resend-verification-code" }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(statusCode);
      expect(JSON.parse(result?.body ?? "{}").message).toBe(message);
    });
  });

  describe("必須フィールド検証", () => {
    it("email が存在しない場合は 400 を返す", async () => {
      const result = await handler(
        makeEvent({
          body: JSON.stringify({}),
          httpMethod: "POST",
          path: "/auth/resend-verification-code",
        }),
        mockContext,
        mockCallback
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
        mockCallback
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
        mockCallback
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
        mockCallback
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
        mockCallback
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
        mockCallback
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
        mockCallback
      );

      expect(result?.statusCode).toBe(500);
    });
  });
});
