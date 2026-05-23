import { handler } from "@/handlers/auth/login";
import {
  makeEvent,
  mockContext,
  mockCallback,
  describeInvalidBodyCases,
  describeCognitoErrorCases,
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

  describeCognitoErrorCases(
    mockRepo.initiateAuth,
    () => handler(makeLoginEvent(), mockContext, mockCallback),
    [
      { name: "NotAuthorizedException", statusCode: 401, error: "InvalidCredentials" },
      { name: "UserNotFoundException", statusCode: 401, error: "InvalidCredentials" },
      { name: "UserNotConfirmedException", statusCode: 403, error: "UserNotConfirmed" },
      { name: "TooManyRequestsException", statusCode: 429, error: "TooManyRequests" },
      { name: "ServiceUnavailableException", statusCode: 500 },
    ],
  );
});
