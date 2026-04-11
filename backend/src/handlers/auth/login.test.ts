import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Context } from "aws-lambda";

import { handler } from "./login";
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
  password: "ValidPassword123",
};

describe("POST /auth/login", () => {
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
        makeEvent({ body, httpMethod: "POST", path: "/auth/login" }),
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
          path: "/auth/login",
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
          path: "/auth/login",
        }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
    });
  });

  describe("パスワードバリデーション", () => {
    it("パスワードが空の場合は 400 を返す", async () => {
      const result = await handler(
        makeEvent({
          body: JSON.stringify({ ...validInput, password: "" }),
          httpMethod: "POST",
          path: "/auth/login",
        }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toContain("password");
    });
  });

  describe("必須フィールド検証", () => {
    it("email が存在しない場合は 400 を返す", async () => {
      const result = await handler(
        makeEvent({
          body: JSON.stringify({ password: validInput.password }),
          httpMethod: "POST",
          path: "/auth/login",
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
          path: "/auth/login",
        }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
    });
  });

  describe("成功系", () => {
    it("有効な認証情報でログインに成功し、200 と accessToken・idToken・refreshToken を返す", async () => {
      mockRepo.initiateAuth.mockResolvedValueOnce({
        accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        idToken: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
        refreshToken: "eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIi...",
        tokenType: "Bearer",
        expiresIn: 3600,
      });

      const result = await handler(
        makeEvent({
          body: JSON.stringify(validInput),
          httpMethod: "POST",
          path: "/auth/login",
        }),
        mockContext,
        mockCallback
      );

      expect(result?.statusCode).toBe(200);
      const body = JSON.parse(result?.body ?? "{}");
      expect(body.accessToken).toBe("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...");
      expect(body.idToken).toBe("eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...");
      expect(body.refreshToken).toBe("eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIi...");
      expect(body.tokenType).toBe("Bearer");
      expect(body.expiresIn).toBe(3600);
      expect(mockRepo.initiateAuth).toHaveBeenCalledWith(validInput.email, validInput.password);
    });
  });

  describe("Cognito エラー系", () => {
    it("認証情報が間違いの場合 401 を返す (NotAuthorizedException)", async () => {
      const error = Object.assign(new Error("Incorrect username or password."), {
        name: "NotAuthorizedException",
      });
      mockRepo.initiateAuth.mockRejectedValueOnce(error);

      const result = await handler(
        makeEvent({
          body: JSON.stringify(validInput),
          httpMethod: "POST",
          path: "/auth/login",
        }),
        mockContext,
        mockCallback
      );

      expect(result?.statusCode).toBe(401);
      const body = JSON.parse(result?.body ?? "{}");
      expect(body.error).toBe("InvalidCredentials");
    });

    it("ユーザーが存在しない場合 401 を返す (UserNotFoundException)", async () => {
      const error = Object.assign(new Error("User does not exist."), {
        name: "UserNotFoundException",
      });
      mockRepo.initiateAuth.mockRejectedValueOnce(error);

      const result = await handler(
        makeEvent({
          body: JSON.stringify(validInput),
          httpMethod: "POST",
          path: "/auth/login",
        }),
        mockContext,
        mockCallback
      );

      expect(result?.statusCode).toBe(401);
      const body = JSON.parse(result?.body ?? "{}");
      expect(body.error).toBe("InvalidCredentials");
    });

    it("メール未確認の場合 403 を返す (UserNotConfirmedException)", async () => {
      const error = Object.assign(new Error("User is not confirmed."), {
        name: "UserNotConfirmedException",
      });
      mockRepo.initiateAuth.mockRejectedValueOnce(error);

      const result = await handler(
        makeEvent({
          body: JSON.stringify(validInput),
          httpMethod: "POST",
          path: "/auth/login",
        }),
        mockContext,
        mockCallback
      );

      expect(result?.statusCode).toBe(403);
      const body = JSON.parse(result?.body ?? "{}");
      expect(body.error).toBe("UserNotConfirmed");
    });

    it("リクエスト過多の場合 429 を返す (TooManyRequestsException)", async () => {
      const error = Object.assign(new Error("Too many requests."), {
        name: "TooManyRequestsException",
      });
      mockRepo.initiateAuth.mockRejectedValueOnce(error);

      const result = await handler(
        makeEvent({
          body: JSON.stringify(validInput),
          httpMethod: "POST",
          path: "/auth/login",
        }),
        mockContext,
        mockCallback
      );

      expect(result?.statusCode).toBe(429);
      const body = JSON.parse(result?.body ?? "{}");
      expect(body.error).toBe("TooManyRequests");
    });

    it("その他の Cognito エラーの場合 500 を返す", async () => {
      const error = Object.assign(new Error("Service unavailable."), {
        name: "ServiceUnavailableException",
      });
      mockRepo.initiateAuth.mockRejectedValueOnce(error);

      const result = await handler(
        makeEvent({
          body: JSON.stringify(validInput),
          httpMethod: "POST",
          path: "/auth/login",
        }),
        mockContext,
        mockCallback
      );

      expect(result?.statusCode).toBe(500);
    });
  });
});
