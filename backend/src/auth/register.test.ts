import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Context } from "aws-lambda";

import { handler } from "./register";
import { makeEvent } from "../test/fixtures";

// Mock CognitoIdentityServiceProvider
const { mockSignUp } = vi.hoisted(() => ({
  mockSignUp: vi.fn(),
}));

vi.mock("@aws-sdk/client-cognito-identity-provider", () => ({
  CognitoIdentityServiceProvider: vi.fn(function () {
    this.signUp = mockSignUp;
  }),
}));

const mockContext = {} as Context;
const mockCallback = { signal: new AbortController().signal };

const validInput = {
  email: "user@example.com",
  password: "ValidPassword123",
};

describe("POST /auth/register", () => {
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
        makeEvent({ body, httpMethod: "POST", path: "/auth/register" }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(statusCode);
      expect(JSON.parse(result?.body ?? "{}").message).toBe(message);
    });
  });

  describe("メールアドレスバリデーション", () => {
    it("メールアドレスが無効な場合は 400 を返す", async () => {
      const result = await handler(
        makeEvent({
          body: JSON.stringify({ ...validInput, email: "invalid-email" }),
          httpMethod: "POST",
          path: "/auth/register",
        }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toContain("email");
    });

    it("メールアドレスが空の場合は 400 を返す", async () => {
      const result = await handler(
        makeEvent({
          body: JSON.stringify({ ...validInput, email: "" }),
          httpMethod: "POST",
          path: "/auth/register",
        }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toContain("email");
    });

    it("メールアドレスが空白のみの場合は 400 を返す", async () => {
      const result = await handler(
        makeEvent({
          body: JSON.stringify({ ...validInput, email: "   " }),
          httpMethod: "POST",
          path: "/auth/register",
        }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toContain("email");
    });
  });

  describe("パスワードバリデーション", () => {
    it("パスワードが 8 文字未満の場合は 400 を返す", async () => {
      const result = await handler(
        makeEvent({
          body: JSON.stringify({ ...validInput, password: "Short1!" }),
          httpMethod: "POST",
          path: "/auth/register",
        }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toContain("password");
    });

    it("パスワードが大文字を含まない場合は 400 を返す", async () => {
      const result = await handler(
        makeEvent({
          body: JSON.stringify({ ...validInput, password: "lowercasepass1" }),
          httpMethod: "POST",
          path: "/auth/register",
        }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toContain("password");
    });

    it("パスワードが小文字を含まない場合は 400 を返す", async () => {
      const result = await handler(
        makeEvent({
          body: JSON.stringify({ ...validInput, password: "UPPERCASE1" }),
          httpMethod: "POST",
          path: "/auth/register",
        }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toContain("password");
    });

    it("パスワードが数字を含まない場合は 400 を返す", async () => {
      const result = await handler(
        makeEvent({
          body: JSON.stringify({ ...validInput, password: "NoNumbersHere" }),
          httpMethod: "POST",
          path: "/auth/register",
        }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toContain("password");
    });

    it("パスワードが空の場合は 400 を返す", async () => {
      const result = await handler(
        makeEvent({
          body: JSON.stringify({ ...validInput, password: "" }),
          httpMethod: "POST",
          path: "/auth/register",
        }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toContain("password");
    });
  });

  describe("成功系", () => {
    it("有効なメール・パスワードで登録に成功し、201 を返す", async () => {
      mockSignUp.mockResolvedValue({
        UserSub: "user-sub-id",
        CodeDeliveryDetails: {
          Destination: "u***@example.com",
          DeliveryMedium: "EMAIL",
        },
      });

      const result = await handler(
        makeEvent({
          body: JSON.stringify(validInput),
          httpMethod: "POST",
          path: "/auth/register",
        }),
        mockContext,
        mockCallback
      );

      expect(result?.statusCode).toBe(201);
      const body = JSON.parse(result?.body ?? "{}");
      expect(body.message).toContain("successfully");
      expect(mockSignUp).toHaveBeenCalled();
    });
  });

  describe("Cognito エラー系", () => {
    it("メール重複時に 400 を返す", async () => {
      const error: { Code: string; message: string } = {
        Code: "UsernameExistsException",
        message: "UsernameExistsException",
      };
      mockSignUp.mockRejectedValue(error);

      const result = await handler(
        makeEvent({
          body: JSON.stringify(validInput),
          httpMethod: "POST",
          path: "/auth/register",
        }),
        mockContext,
        mockCallback
      );

      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toContain("already");
    });

    it("無効なパスワード時に 400 を返す", async () => {
      const error: { Code: string; message: string } = {
        Code: "InvalidPasswordException",
        message: "InvalidPasswordException",
      };
      mockSignUp.mockRejectedValue(error);

      const result = await handler(
        makeEvent({
          body: JSON.stringify(validInput),
          httpMethod: "POST",
          path: "/auth/register",
        }),
        mockContext,
        mockCallback
      );

      expect(result?.statusCode).toBe(400);
      const message = JSON.parse(result?.body ?? "{}").message;
      expect(message.toLowerCase()).toContain("password");
    });

    it("その他の Cognito エラー時に 500 を返す", async () => {
      const error: { Code: string; message: string } = {
        Code: "ServiceUnavailableException",
        message: "ServiceUnavailableException",
      };
      mockSignUp.mockRejectedValue(error);

      const result = await handler(
        makeEvent({
          body: JSON.stringify(validInput),
          httpMethod: "POST",
          path: "/auth/register",
        }),
        mockContext,
        mockCallback
      );

      expect(result?.statusCode).toBe(500);
    });
  });

  describe("必須フィールド検証", () => {
    it("email が存在しない場合は 400 を返す", async () => {
      const result = await handler(
        makeEvent({
          body: JSON.stringify({ password: validInput.password }),
          httpMethod: "POST",
          path: "/auth/register",
        }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
    });

    it("password が存在しない場合は 400 を返す", async () => {
      const result = await handler(
        makeEvent({
          body: JSON.stringify({ email: validInput.email }),
          httpMethod: "POST",
          path: "/auth/register",
        }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
    });
  });
});
