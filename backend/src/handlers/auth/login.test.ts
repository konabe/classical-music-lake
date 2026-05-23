import { handler } from "@/handlers/auth/login";
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
  email: "user@example.com",
  password: "ValidPassword123",
};

const makeLoginEvent = (body: object = validInput) =>
  makeEvent({ body: JSON.stringify(body), httpMethod: "POST", path: "/auth/login" });

describe("POST /auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describeInvalidBodyCases(handler, "/auth/login");

  describe("バリデーション", () => {
    it("メールアドレスが無効な場合は 400 を返す", async () => {
      const result = await handler(
        makeLoginEvent({ ...validInput, email: "invalid-email" }),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toContain("email");
    });

    it("パスワードが空の場合は 400 を返す", async () => {
      const result = await handler(
        makeLoginEvent({ ...validInput, password: "" }),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toContain("password");
    });

    it.each([[{ password: validInput.password }], [{ email: validInput.email }]])(
      "必須フィールドが欠けている場合は 400 を返す: %o",
      async (body) => {
        const result = await handler(makeLoginEvent(body), mockContext, mockCallback);
        expect(result?.statusCode).toBe(400);
      },
    );
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

      const result = await handler(makeLoginEvent(), mockContext, mockCallback);

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
    it.each<[string, number, string | undefined]>([
      ["NotAuthorizedException", 401, "InvalidCredentials"],
      ["UserNotFoundException", 401, "InvalidCredentials"],
      ["UserNotConfirmedException", 403, "UserNotConfirmed"],
      ["TooManyRequestsException", 429, "TooManyRequests"],
      ["ServiceUnavailableException", 500, undefined],
    ])("%s のとき %i を返す", async (name, statusCode, errorCode) => {
      mockRepo.initiateAuth.mockRejectedValueOnce(makeCognitoError(name, "error"));

      const result = await handler(makeLoginEvent(), mockContext, mockCallback);

      expect(result?.statusCode).toBe(statusCode);
      if (errorCode !== undefined) {
        expect(JSON.parse(result?.body ?? "{}").error).toBe(errorCode);
      }
    });
  });
});
