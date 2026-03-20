import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAuth } from "./useAuth";

const mockFetch = vi.fn();

vi.mock("./useApiBase", () => ({
  useApiBase: () => "",
}));

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  mockFetch.mockClear();
});

describe("useAuth", () => {
  describe("validateEmail", () => {
    it("有効なメールアドレスのとき true を返す", () => {
      const { validateEmail } = useAuth();
      expect(validateEmail("user@example.com")).toBe(true);
    });

    it("メールアドレスが空のとき false を返す", () => {
      const { validateEmail } = useAuth();
      expect(validateEmail("")).toBe(false);
    });

    it("メールアドレスが空白のみのとき false を返す", () => {
      const { validateEmail } = useAuth();
      expect(validateEmail("   ")).toBe(false);
    });

    it("@ がないとき false を返す", () => {
      const { validateEmail } = useAuth();
      expect(validateEmail("invalid-email")).toBe(false);
    });

    it("ドメインがないとき false を返す", () => {
      const { validateEmail } = useAuth();
      expect(validateEmail("user@")).toBe(false);
    });
  });

  describe("validatePassword", () => {
    it("有効なパスワードのとき true を返す", () => {
      const { validatePassword } = useAuth();
      expect(validatePassword("ValidPassword123")).toBe(true);
    });

    it("パスワードが空のとき false を返す", () => {
      const { validatePassword } = useAuth();
      expect(validatePassword("")).toBe(false);
    });

    it("8文字未満のとき false を返す", () => {
      const { validatePassword } = useAuth();
      expect(validatePassword("Short1A")).toBe(false);
    });

    it("大文字を含まないとき false を返す", () => {
      const { validatePassword } = useAuth();
      expect(validatePassword("lowercase123")).toBe(false);
    });

    it("小文字を含まないとき false を返す", () => {
      const { validatePassword } = useAuth();
      expect(validatePassword("UPPERCASE123")).toBe(false);
    });

    it("数字を含まないとき false を返す", () => {
      const { validatePassword } = useAuth();
      expect(validatePassword("NoNumbers!A")).toBe(false);
    });
  });

  describe("getPasswordValidationError", () => {
    it("有効なパスワードのとき null を返す", () => {
      const { getPasswordValidationError } = useAuth();
      expect(getPasswordValidationError("ValidPassword123")).toBeNull();
    });

    it("パスワードが空のとき 'Password is required' を返す", () => {
      const { getPasswordValidationError } = useAuth();
      expect(getPasswordValidationError("")).toBe("Password is required");
    });

    it("8文字未満のとき文字数エラーメッセージを返す", () => {
      const { getPasswordValidationError } = useAuth();
      expect(getPasswordValidationError("Short1A")).toContain("8 characters");
    });

    it("大文字を含まないとき大文字エラーメッセージを返す", () => {
      const { getPasswordValidationError } = useAuth();
      expect(getPasswordValidationError("lowercase123")).toContain("uppercase");
    });

    it("小文字を含まないとき小文字エラーメッセージを返す", () => {
      const { getPasswordValidationError } = useAuth();
      expect(getPasswordValidationError("UPPERCASE123")).toContain("lowercase");
    });

    it("数字を含まないとき数字エラーメッセージを返す", () => {
      const { getPasswordValidationError } = useAuth();
      expect(getPasswordValidationError("NoNumbersHere")).toContain("digit");
    });
  });

  describe("register", () => {
    it("メールアドレスが無効なとき success: false を返す", async () => {
      const { register } = useAuth();
      const result = await register("invalid-email", "ValidPassword123");
      expect(result.success).toBe(false);
      expect(result.error).toContain("email");
    });

    it("パスワードが無効なとき success: false を返す", async () => {
      const { register } = useAuth();
      const result = await register("user@example.com", "weak");
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("API 呼び出しが成功したとき success: true を返す", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ message: "User created successfully." }),
      });

      const { register } = useAuth();
      const result = await register("user@example.com", "ValidPassword123");

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        "/auth/register",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ email: "user@example.com", password: "ValidPassword123" }),
        })
      );
    });

    it("API がエラーを返したとき success: false とエラーメッセージを返す", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ message: "An account with the given email already exists." }),
      });

      const { register } = useAuth();
      const result = await register("user@example.com", "ValidPassword123");

      expect(result.success).toBe(false);
      expect(result.error).toBe("An account with the given email already exists.");
    });

    it("ネットワークエラー時に success: false を返す", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      const { register } = useAuth();
      const result = await register("user@example.com", "ValidPassword123");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network error");
    });
  });
});
