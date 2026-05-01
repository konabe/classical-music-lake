import { describe, it, expect, vi, beforeEach } from "vitest";

import { handler } from "./refresh";
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
  refreshToken: "valid-refresh-token",
};

describe("POST /auth/refresh", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describeInvalidBodyCases(handler, "/auth/refresh");

  describe("refreshToken バリデーション", () => {
    it("refreshToken が空の場合は 400 を返す", async () => {
      const result = await handler(
        makeEvent({
          body: JSON.stringify({ refreshToken: "" }),
          httpMethod: "POST",
          path: "/auth/refresh",
        }),
        mockContext,
        mockCallback,
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
        mockCallback,
      );
      expect(result?.statusCode).toBe(400);
    });
  });

  describe("成功系", () => {
    it("有効なリフレッシュトークンで新しいトークンを返す", async () => {
      mockRepo.refreshToken.mockResolvedValueOnce({
        accessToken: "new-access-token",
        idToken: "new-id-token",
        tokenType: "Bearer",
        expiresIn: 3600,
      });

      const result = await handler(
        makeEvent({
          body: JSON.stringify(validInput),
          httpMethod: "POST",
          path: "/auth/refresh",
        }),
        mockContext,
        mockCallback,
      );

      expect(result?.statusCode).toBe(200);
      const body = JSON.parse(result?.body ?? "{}");
      expect(body.accessToken).toBe("new-access-token");
      expect(body.idToken).toBe("new-id-token");
      expect(body.tokenType).toBe("Bearer");
      expect(body.expiresIn).toBe(3600);
      expect(mockRepo.refreshToken).toHaveBeenCalledWith(validInput.refreshToken);
    });
  });

  describe("Cognito エラー系", () => {
    it("リフレッシュトークンが無効な場合 401 を返す (NotAuthorizedException)", async () => {
      const error = Object.assign(new Error("Invalid Refresh Token."), {
        name: "NotAuthorizedException",
      });
      mockRepo.refreshToken.mockRejectedValueOnce(error);

      const result = await handler(
        makeEvent({
          body: JSON.stringify(validInput),
          httpMethod: "POST",
          path: "/auth/refresh",
        }),
        mockContext,
        mockCallback,
      );

      expect(result?.statusCode).toBe(401);
      const body = JSON.parse(result?.body ?? "{}");
      expect(body.error).toBe("InvalidRefreshToken");
    });

    it("リクエスト過多の場合 429 を返す (TooManyRequestsException)", async () => {
      const error = Object.assign(new Error("Too many requests."), {
        name: "TooManyRequestsException",
      });
      mockRepo.refreshToken.mockRejectedValueOnce(error);

      const result = await handler(
        makeEvent({
          body: JSON.stringify(validInput),
          httpMethod: "POST",
          path: "/auth/refresh",
        }),
        mockContext,
        mockCallback,
      );

      expect(result?.statusCode).toBe(429);
      const body = JSON.parse(result?.body ?? "{}");
      expect(body.error).toBe("TooManyRequests");
    });

    it("その他の Cognito エラーの場合 500 を返す", async () => {
      const error = Object.assign(new Error("Service unavailable."), {
        name: "ServiceUnavailableException",
      });
      mockRepo.refreshToken.mockRejectedValueOnce(error);

      const result = await handler(
        makeEvent({
          body: JSON.stringify(validInput),
          httpMethod: "POST",
          path: "/auth/refresh",
        }),
        mockContext,
        mockCallback,
      );

      expect(result?.statusCode).toBe(500);
    });
  });
});
