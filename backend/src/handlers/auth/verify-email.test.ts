import { describe, it, expect, vi, beforeEach } from "vitest";

import { handler } from "./verify-email";
import {
  makeEvent,
  mockContext,
  mockCallback,
  describeInvalidBodyCases,
} from "../../test/fixtures";

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
  code: "123456",
};

describe("POST /auth/verify-email", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describeInvalidBodyCases(handler, "/auth/verify-email");

  describe("必須フィールド検証", () => {
    it("email が存在しない場合は 400 を返す", async () => {
      const result = await handler(
        makeEvent({
          body: JSON.stringify({ code: validInput.code }),
          httpMethod: "POST",
          path: "/auth/verify-email",
        }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
    });

    it("code が存在しない場合は 400 を返す", async () => {
      const result = await handler(
        makeEvent({
          body: JSON.stringify({ email: validInput.email }),
          httpMethod: "POST",
          path: "/auth/verify-email",
        }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
    });

    it("email が無効な場合は 400 を返す", async () => {
      const result = await handler(
        makeEvent({
          body: JSON.stringify({ ...validInput, email: "invalid-email" }),
          httpMethod: "POST",
          path: "/auth/verify-email",
        }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toContain("email");
    });

    it("code が空の場合は 400 を返す", async () => {
      const result = await handler(
        makeEvent({
          body: JSON.stringify({ ...validInput, code: "" }),
          httpMethod: "POST",
          path: "/auth/verify-email",
        }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
    });
  });

  describe("成功系", () => {
    it("有効な email と code で確認に成功し、200 を返す", async () => {
      mockRepo.confirmSignUp.mockResolvedValueOnce();

      const result = await handler(
        makeEvent({
          body: JSON.stringify(validInput),
          httpMethod: "POST",
          path: "/auth/verify-email",
        }),
        mockContext,
        mockCallback
      );

      expect(result?.statusCode).toBe(200);
      const body = JSON.parse(result?.body ?? "{}");
      expect(body.message).toBeDefined();
      expect(mockRepo.confirmSignUp).toHaveBeenCalledWith(validInput.email, validInput.code);
    });
  });

  describe("Cognito エラー系", () => {
    it("コードが不一致の場合は 400 を返す", async () => {
      const error = Object.assign(new Error("Invalid code"), { name: "CodeMismatchException" });
      mockRepo.confirmSignUp.mockRejectedValueOnce(error);

      const result = await handler(
        makeEvent({
          body: JSON.stringify(validInput),
          httpMethod: "POST",
          path: "/auth/verify-email",
        }),
        mockContext,
        mockCallback
      );

      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").error).toBe("CodeMismatch");
    });

    it("コードが期限切れの場合は 400 を返す", async () => {
      const error = Object.assign(new Error("Expired code"), { name: "ExpiredCodeException" });
      mockRepo.confirmSignUp.mockRejectedValueOnce(error);

      const result = await handler(
        makeEvent({
          body: JSON.stringify(validInput),
          httpMethod: "POST",
          path: "/auth/verify-email",
        }),
        mockContext,
        mockCallback
      );

      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").error).toBe("ExpiredCode");
    });

    it("既に確認済みの場合は 400 を返す", async () => {
      const error = Object.assign(new Error("User cannot be confirmed"), {
        name: "NotAuthorizedException",
      });
      mockRepo.confirmSignUp.mockRejectedValueOnce(error);

      const result = await handler(
        makeEvent({
          body: JSON.stringify(validInput),
          httpMethod: "POST",
          path: "/auth/verify-email",
        }),
        mockContext,
        mockCallback
      );

      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").error).toBe("NotAuthorized");
    });

    it("リクエスト過多時に 429 を返す", async () => {
      const error = Object.assign(new Error("Too many requests"), {
        name: "TooManyRequestsException",
      });
      mockRepo.confirmSignUp.mockRejectedValueOnce(error);

      const result = await handler(
        makeEvent({
          body: JSON.stringify(validInput),
          httpMethod: "POST",
          path: "/auth/verify-email",
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
      mockRepo.confirmSignUp.mockRejectedValueOnce(error);

      const result = await handler(
        makeEvent({
          body: JSON.stringify(validInput),
          httpMethod: "POST",
          path: "/auth/verify-email",
        }),
        mockContext,
        mockCallback
      );

      expect(result?.statusCode).toBe(500);
    });
  });
});
