import { handler } from "@/handlers/auth/register";
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

const makeRegisterEvent = (body: object = validInput) =>
  makeEvent({ body: JSON.stringify(body), httpMethod: "POST", path: "/auth/register" });

describe("POST /auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describeInvalidBodyCases(handler, (body) =>
    makeEvent({ body, httpMethod: "POST", path: "/auth/register" }),
  );

  describe("バリデーション", () => {
    it.each([
      [{ ...validInput, email: "invalid-email" }, "email"],
      [{ ...validInput, email: "" }, "email"],
      [{ ...validInput, email: "   " }, "email"],
      [{ ...validInput, password: "Short1!" }, "password"],
      [{ ...validInput, password: "lowercasepass1" }, "password"],
      [{ ...validInput, password: "UPPERCASE1" }, "password"],
      [{ ...validInput, password: "NoNumbersHere" }, "password"],
      [{ ...validInput, password: "" }, "password"],
    ])("不正な入力 %o は 400 を返す", async (body, field) => {
      const result = await handler(makeRegisterEvent(body), mockContext, mockCallback);
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toContain(field);
    });

    it.each([[{ password: validInput.password }], [{ email: validInput.email }]])(
      "必須フィールドが欠けている場合は 400 を返す: %o",
      async (body) => {
        const result = await handler(makeRegisterEvent(body), mockContext, mockCallback);
        expect(result?.statusCode).toBe(400);
      },
    );
  });

  describe("成功系", () => {
    it("有効なメール・パスワードで登録に成功し、201 を返す", async () => {
      mockRepo.signUp.mockResolvedValueOnce(undefined);

      const result = await handler(makeRegisterEvent(), mockContext, mockCallback);

      expect(result?.statusCode).toBe(201);
      const body = JSON.parse(result?.body ?? "{}");
      expect(body.message).toContain("successfully");
      expect(mockRepo.signUp).toHaveBeenCalledWith(validInput.email, validInput.password);
    });
  });

  describe("Cognito エラー系", () => {
    it("メール重複時に 400 を返す", async () => {
      mockRepo.signUp.mockRejectedValueOnce(makeCognitoError("UsernameExistsException"));
      const result = await handler(makeRegisterEvent(), mockContext, mockCallback);
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message).toContain("already");
    });

    it("無効なパスワード時に 400 を返す", async () => {
      mockRepo.signUp.mockRejectedValueOnce(makeCognitoError("InvalidPasswordException"));
      const result = await handler(makeRegisterEvent(), mockContext, mockCallback);
      expect(result?.statusCode).toBe(400);
      expect(JSON.parse(result?.body ?? "{}").message.toLowerCase()).toContain("password");
    });

    it("リクエスト過多時に 429 を返す", async () => {
      mockRepo.signUp.mockRejectedValueOnce(makeCognitoError("TooManyRequestsException"));
      const result = await handler(makeRegisterEvent(), mockContext, mockCallback);
      expect(result?.statusCode).toBe(429);
      expect(JSON.parse(result?.body ?? "{}").message).toContain("again later");
    });

    it("その他の Cognito エラー時に 500 を返す", async () => {
      mockRepo.signUp.mockRejectedValueOnce(makeCognitoError("ServiceUnavailableException"));
      const result = await handler(makeRegisterEvent(), mockContext, mockCallback);
      expect(result?.statusCode).toBe(500);
    });
  });
});
