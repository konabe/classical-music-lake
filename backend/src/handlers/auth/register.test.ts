import { describe, it, expect, vi, beforeEach } from "vitest";

import { handler } from "./register";
import {
  makeEvent,
  mockContext,
  mockCallback,
  describeInvalidBodyCases,
} from "../../test/fixtures";

const mockRepo = vi.hoisted(() => {
  return {
    signUp: vi.fn(),
    initiateAuth: vi.fn(),
    confirmSignUp: vi.fn(),
    resendConfirmationCode: vi.fn(),
    refreshToken: vi.fn(),
    listUsersByEmail: vi.fn(),
    linkProviderForUser: vi.fn(),
  };
});

vi.mock("../../repositories/cognito-auth-repository", () => {
  return {
    CognitoAuthRepository: vi.fn().mockImplementation(function () {
      return mockRepo;
    }),
  };
});

const validInput = {
  email: "user@example.com",
  password: "ValidPassword123",
};

describe("POST /auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describeInvalidBodyCases(handler, "/auth/register");

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
      mockRepo.signUp.mockResolvedValueOnce();

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
      expect(mockRepo.signUp).toHaveBeenCalledWith(validInput.email, validInput.password);
    });
  });

  describe("Cognito エラー系", () => {
    it("メール重複時に 400 を返す", async () => {
      const error = Object.assign(new Error("UsernameExistsException"), {
        name: "UsernameExistsException",
      });
      mockRepo.signUp.mockRejectedValueOnce(error);

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
      const error = Object.assign(new Error("InvalidPasswordException"), {
        name: "InvalidPasswordException",
      });
      mockRepo.signUp.mockRejectedValueOnce(error);

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
      const error = Object.assign(new Error("ServiceUnavailableException"), {
        name: "ServiceUnavailableException",
      });
      mockRepo.signUp.mockRejectedValueOnce(error);

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

    it("リクエスト過多時に 429 を返す", async () => {
      const error = Object.assign(new Error("TooManyRequestsException"), {
        name: "TooManyRequestsException",
      });
      mockRepo.signUp.mockRejectedValueOnce(error);

      const result = await handler(
        makeEvent({
          body: JSON.stringify(validInput),
          httpMethod: "POST",
          path: "/auth/register",
        }),
        mockContext,
        mockCallback
      );

      expect(result?.statusCode).toBe(429);
      expect(JSON.parse(result?.body ?? "{}").message).toContain("again later");
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
