import { handler } from "@/handlers/auth/verify-email";
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
  code: "123456",
};

const makeVerifyEmailEvent = (body: object = validInput) =>
  makeEvent({ body: JSON.stringify(body), httpMethod: "POST", path: "/auth/verify-email" });

describe("POST /auth/verify-email", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describeInvalidBodyCases(handler, "/auth/verify-email");

  describe("バリデーション", () => {
    it("email が無効な場合は 400 を返す", async () => {
      const result = await handler(
        makeVerifyEmailEvent({ ...validInput, email: "invalid-email" }),
        mockContext,
        mockCallback,
      );
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toContain("email");
    });

    it.each([
      [{ code: validInput.code }],
      [{ email: validInput.email }],
      [{ ...validInput, code: "" }],
    ])("必須フィールドが欠けている・空の場合は 400 を返す: %o", async (body) => {
      const result = await handler(makeVerifyEmailEvent(body), mockContext, mockCallback);
      expect(result?.statusCode).toBe(400);
    });
  });

  describe("成功系", () => {
    it("有効な email と code で確認に成功し、200 を返す", async () => {
      mockRepo.confirmSignUp.mockResolvedValueOnce(undefined);

      const result = await handler(makeVerifyEmailEvent(), mockContext, mockCallback);

      expect(result?.statusCode).toBe(200);
      const body = JSON.parse(result?.body ?? "{}");
      expect(body.message).toBeDefined();
      expect(mockRepo.confirmSignUp).toHaveBeenCalledWith(validInput.email, validInput.code);
    });
  });

  describeCognitoErrorCases(
    mockRepo.confirmSignUp,
    () => handler(makeVerifyEmailEvent(), mockContext, mockCallback),
    [
      { name: "CodeMismatchException", statusCode: 400, error: "CodeMismatch" },
      { name: "ExpiredCodeException", statusCode: 400, error: "ExpiredCode" },
      { name: "NotAuthorizedException", statusCode: 400, error: "NotAuthorized" },
      { name: "TooManyRequestsException", statusCode: 429 },
      { name: "ServiceUnavailableException", statusCode: 500 },
    ],
  );
});
