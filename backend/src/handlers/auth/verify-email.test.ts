import { handler } from "@/handlers/auth/verify-email";
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
  code: "123456",
};

const makeVerifyEmailEvent = (body: object = validInput) =>
  makeEvent({ body: JSON.stringify(body), httpMethod: "POST", path: "/auth/verify-email" });

describe("POST /auth/verify-email", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describeInvalidBodyCases(handler, (body) =>
    makeEvent({ body, httpMethod: "POST", path: "/auth/verify-email" }),
  );

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

  describe("Cognito エラー系", () => {
    it.each<[string, number, string | undefined]>([
      ["CodeMismatchException", 400, "CodeMismatch"],
      ["ExpiredCodeException", 400, "ExpiredCode"],
      ["NotAuthorizedException", 400, "NotAuthorized"],
      ["TooManyRequestsException", 429, undefined],
      ["ServiceUnavailableException", 500, undefined],
    ])("%s のとき %i を返す", async (name, statusCode, errorCode) => {
      mockRepo.confirmSignUp.mockRejectedValueOnce(makeCognitoError(name));

      const result = await handler(makeVerifyEmailEvent(), mockContext, mockCallback);

      expect(result?.statusCode).toBe(statusCode);
      if (errorCode !== undefined) {
        expect(JSON.parse(result?.body ?? "{}").error).toBe(errorCode);
      }
    });
  });
});
