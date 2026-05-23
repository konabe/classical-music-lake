import { handler } from "@/handlers/auth/resend-verification-code";
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
      mockRepo.resendConfirmationCode.mockResolvedValueOnce(undefined);

      const result = await handler(makeResendEvent(), mockContext, mockCallback);

      expect(result?.statusCode).toBe(200);
      const body = JSON.parse(result?.body ?? "{}");
      expect(body.message).toBeDefined();
      expect(mockRepo.resendConfirmationCode).toHaveBeenCalledWith(validInput.email);
    });
  });

  describeCognitoErrorCases(
    mockRepo.resendConfirmationCode,
    () => handler(makeResendEvent(), mockContext, mockCallback),
    [
      { name: "InvalidParameterException", statusCode: 400, error: "UserAlreadyConfirmed" },
      { name: "UserNotFoundException", statusCode: 400 },
      { name: "TooManyRequestsException", statusCode: 429 },
      { name: "ServiceUnavailableException", statusCode: 500 },
    ],
  );
});
