import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Context } from "aws-lambda";

import { handler } from "./refresh";
import { makeEvent } from "../test/fixtures";

// Mock AWS SDK v3 Cognito
const { mockSend } = vi.hoisted(() => ({
  mockSend: vi.fn(),
}));

vi.mock("@aws-sdk/client-cognito-identity-provider", () => ({
  CognitoIdentityProviderClient: vi.fn(function (this: Record<string, unknown>) {
    this.send = mockSend;
  }),
  InitiateAuthCommand: vi.fn(function (this: Record<string, unknown>, input: unknown) {
    this.input = input;
  }),
}));

const mockContext = {} as Context;
const mockCallback = { signal: new AbortController().signal };

const validInput = {
  refreshToken: "valid-refresh-token",
};

describe("POST /auth/refresh", () => {
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
        makeEvent({ body, httpMethod: "POST", path: "/auth/refresh" }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(statusCode);
      expect(JSON.parse(result?.body ?? "{}").message).toBe(message);
    });
  });

  describe("refreshToken バリデーション", () => {
    it("refreshToken が空の場合は 400 を返す", async () => {
      const result = await handler(
        makeEvent({
          body: JSON.stringify({ refreshToken: "" }),
          httpMethod: "POST",
          path: "/auth/refresh",
        }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toContain("refreshToken");
    });

    it("refreshToken が存在しない場合は 400 を返す", async () => {
      const result = await handler(
        makeEvent({
          body: JSON.stringify({}),
          httpMethod: "POST",
          path: "/auth/refresh",
        }),
        mockContext,
        mockCallback
      );
      expect(result?.statusCode).toBe(400);
    });
  });

  describe("成功系", () => {
    it("有効なリフレッシュトークンで新しいトークンを返す", async () => {
      mockSend.mockResolvedValue({
        AuthenticationResult: {
          AccessToken: "new-access-token",
          IdToken: "new-id-token",
          TokenType: "Bearer",
          ExpiresIn: 3600,
        },
      });

      const result = await handler(
        makeEvent({
          body: JSON.stringify(validInput),
          httpMethod: "POST",
          path: "/auth/refresh",
        }),
        mockContext,
        mockCallback
      );

      expect(result?.statusCode).toBe(200);
      const body = JSON.parse(result?.body ?? "{}");
      expect(body.accessToken).toBe("new-access-token");
      expect(body.idToken).toBe("new-id-token");
      expect(body.tokenType).toBe("Bearer");
      expect(body.expiresIn).toBe(3600);
      expect(mockSend).toHaveBeenCalled();
    });
  });

  describe("Cognito エラー系", () => {
    it("リフレッシュトークンが無効な場合 401 を返す (NotAuthorizedException)", async () => {
      const error = { name: "NotAuthorizedException", message: "Invalid Refresh Token." };
      mockSend.mockRejectedValue(error);

      const result = await handler(
        makeEvent({
          body: JSON.stringify(validInput),
          httpMethod: "POST",
          path: "/auth/refresh",
        }),
        mockContext,
        mockCallback
      );

      expect(result?.statusCode).toBe(401);
      const body = JSON.parse(result?.body ?? "{}");
      expect(body.error).toBe("InvalidRefreshToken");
    });

    it("リクエスト過多の場合 429 を返す (TooManyRequestsException)", async () => {
      const error = { name: "TooManyRequestsException", message: "Too many requests." };
      mockSend.mockRejectedValue(error);

      const result = await handler(
        makeEvent({
          body: JSON.stringify(validInput),
          httpMethod: "POST",
          path: "/auth/refresh",
        }),
        mockContext,
        mockCallback
      );

      expect(result?.statusCode).toBe(429);
      const body = JSON.parse(result?.body ?? "{}");
      expect(body.error).toBe("TooManyRequests");
    });

    it("その他の Cognito エラーの場合 500 を返す", async () => {
      const error = { name: "ServiceUnavailableException", message: "Service unavailable." };
      mockSend.mockRejectedValue(error);

      const result = await handler(
        makeEvent({
          body: JSON.stringify(validInput),
          httpMethod: "POST",
          path: "/auth/refresh",
        }),
        mockContext,
        mockCallback
      );

      expect(result?.statusCode).toBe(500);
    });
  });
});
