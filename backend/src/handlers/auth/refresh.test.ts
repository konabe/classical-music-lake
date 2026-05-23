import { handler } from "@/handlers/auth/refresh";
import {
  makeEvent,
  mockContext,
  mockCallback,
  describeInvalidBodyCases,
  makeCognitoError,
} from "@/test/fixtures";
import { mockCognitoAuthRepo as mockRepo } from "@/repositories/__mocks__/cognito-auth-repository";

vi.mock("@/repositories/cognito-auth-repository");

const validInput = {
  refreshToken: "valid-refresh-token",
};

const makeRefreshEvent = (body: object = validInput) =>
  makeEvent({ body: JSON.stringify(body), httpMethod: "POST", path: "/auth/refresh" });

describe("POST /auth/refresh", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describeInvalidBodyCases(handler, "/auth/refresh");

  describe("バリデーション", () => {
    it.each([[{ refreshToken: "" }], [{}]])(
      "refreshToken が空・欠けている場合は 400 を返す: %o",
      async (body) => {
        const result = await handler(makeRefreshEvent(body), mockContext, mockCallback);
        expect(result?.statusCode).toBe(400);
      },
    );
  });

  describe("成功系", () => {
    it("有効なリフレッシュトークンで新しいトークンを返す", async () => {
      mockRepo.refreshToken.mockResolvedValueOnce({
        accessToken: "new-access-token",
        idToken: "new-id-token",
        tokenType: "Bearer",
        expiresIn: 3600,
      });

      const result = await handler(makeRefreshEvent(), mockContext, mockCallback);

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
    it.each<[string, number, string | undefined]>([
      ["NotAuthorizedException", 401, "InvalidRefreshToken"],
      ["TooManyRequestsException", 429, "TooManyRequests"],
      ["ServiceUnavailableException", 500, undefined],
    ])("%s のとき %i を返す", async (name, statusCode, errorCode) => {
      mockRepo.refreshToken.mockRejectedValueOnce(makeCognitoError(name));

      const result = await handler(makeRefreshEvent(), mockContext, mockCallback);

      expect(result?.statusCode).toBe(statusCode);
      if (errorCode !== undefined) {
        expect(JSON.parse(result?.body ?? "{}").error).toBe(errorCode);
      }
    });
  });
});
