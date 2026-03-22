import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Context } from "aws-lambda";

import { handler } from "./verify-email";
import { makeEvent } from "../test/fixtures";

const { mockSend } = vi.hoisted(() => ({
  mockSend: vi.fn(),
}));

vi.mock("@aws-sdk/client-cognito-identity-provider", () => ({
  CognitoIdentityProviderClient: vi.fn(function () {
    this.send = mockSend;
  }),
  ConfirmSignUpCommand: vi.fn(function (input) {
    this.input = input;
  }),
}));

const mockContext = {} as Context;
const mockCallback = { signal: new AbortController().signal };

const validInput = {
  email: "user@example.com",
  code: "123456",
};

describe("POST /auth/verify-email", () => {
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
        makeEvent({ body, httpMethod: "POST", path: "/auth/verify-email" }),
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
      mockSend.mockResolvedValue({});

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
      expect(mockSend).toHaveBeenCalled();
    });
  });

  describe("Cognito エラー系", () => {
    it("コードが不一致の場合は 400 を返す", async () => {
      mockSend.mockRejectedValue({ name: "CodeMismatchException", message: "Invalid code" });

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
      mockSend.mockRejectedValue({ name: "ExpiredCodeException", message: "Expired code" });

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
      mockSend.mockRejectedValue({
        name: "NotAuthorizedException",
        message: "User cannot be confirmed",
      });

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
      mockSend.mockRejectedValue({
        name: "TooManyRequestsException",
        message: "Too many requests",
      });

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
      mockSend.mockRejectedValue({
        name: "ServiceUnavailableException",
        message: "Service unavailable",
      });

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
