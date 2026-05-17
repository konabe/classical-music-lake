import { handler } from "@/handlers/auth/resend-verification-code";
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
};

const makeResendEvent = (body: object = validInput) =>
  makeEvent({
    body: JSON.stringify(body),
    httpMethod: "POST",
    path: "/auth/resend-verification-code",
  });

describe("POST /auth/resend-verification-code", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describeInvalidBodyCases(handler, "/auth/resend-verification-code");

  describe("バリデーション", () => {
    it.each([[{ email: "invalid-email" }], [{}]])(
      "email が無効・欠けている場合は 400 を返す: %o",
      async (body) => {
        const result = await handler(makeResendEvent(body), mockContext, mockCallback);
        expect(result?.statusCode).toBe(400);
      },
    );
  });

  describe("成功系", () => {
    it("有効な email で再送信に成功し、200 を返す", async () => {
      mockRepo.resendConfirmationCode.mockResolvedValueOnce();

      const result = await handler(makeResendEvent(), mockContext, mockCallback);

      expect(result?.statusCode).toBe(200);
      const body = JSON.parse(result?.body ?? "{}");
      expect(body.message).toBeDefined();
      expect(mockRepo.resendConfirmationCode).toHaveBeenCalledWith(validInput.email);
    });
  });

  describe("Cognito エラー系", () => {
    it.each<[string, number, string | undefined]>([
      ["InvalidParameterException", 400, "UserAlreadyConfirmed"],
      ["UserNotFoundException", 400, undefined],
      ["TooManyRequestsException", 429, undefined],
      ["ServiceUnavailableException", 500, undefined],
    ])("%s のとき %i を返す", async (name, statusCode, errorCode) => {
      mockRepo.resendConfirmationCode.mockRejectedValueOnce(makeCognitoError(name));

      const result = await handler(makeResendEvent(), mockContext, mockCallback);

      expect(result?.statusCode).toBe(statusCode);
      if (errorCode !== undefined) {
        expect(JSON.parse(result?.body ?? "{}").error).toBe(errorCode);
      }
    });
  });
});
