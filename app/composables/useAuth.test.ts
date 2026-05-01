import {
  useAuth,
  ACCESS_TOKEN_KEY,
  ID_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  TOKEN_EXPIRES_AT_KEY,
} from "./useAuth";

const mockFetch = vi.fn();
const mockRouterPush = vi.fn();

// Mock useApiBase to return URL without trailing slash
// (useApiBase removes trailing slashes from the config)
vi.mock("./useApiBase", () => ({
  useApiBase: () => "https://api.example.com",
}));

vi.mock("./useCognitoConfig", () => ({
  useCognitoConfig: () => ({
    domain: "test.auth.ap-northeast-1.amazoncognito.com",
    clientId: "test-client-id",
  }),
}));

vi.mock("#app", () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  vi.stubGlobal("location", { href: "", origin: "https://app.example.com" });
  mockFetch.mockClear();
  mockRouterPush.mockClear();
  localStorage.clear();
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

    it("パスワードが空のとき入力を促すエラーメッセージを返す", () => {
      const { getPasswordValidationError } = useAuth();
      expect(getPasswordValidationError("")).toBe("パスワードを入力してください");
    });

    it("8文字未満のとき文字数エラーメッセージを返す", () => {
      const { getPasswordValidationError } = useAuth();
      expect(getPasswordValidationError("Short1A")).toContain("8文字以上");
    });

    it("大文字を含まないとき大文字エラーメッセージを返す", () => {
      const { getPasswordValidationError } = useAuth();
      expect(getPasswordValidationError("lowercase123")).toContain("大文字");
    });

    it("小文字を含まないとき小文字エラーメッセージを返す", () => {
      const { getPasswordValidationError } = useAuth();
      expect(getPasswordValidationError("UPPERCASE123")).toContain("小文字");
    });

    it("数字を含まないとき数字エラーメッセージを返す", () => {
      const { getPasswordValidationError } = useAuth();
      expect(getPasswordValidationError("NoNumbersHere")).toContain("数字");
    });
  });

  describe("register", () => {
    it("メールアドレスが無効なとき success: false と errorType: email を返す", async () => {
      const { register } = useAuth();
      const result = await register("invalid-email", "ValidPassword123");
      expect(result.success).toBe(false);
      expect(result.errorType).toBe("email");
      expect(result.error).toContain("メールアドレス");
    });

    it("パスワードが無効なとき success: false と errorType: password を返す", async () => {
      const { register } = useAuth();
      const result = await register("user@example.com", "weak");
      expect(result.success).toBe(false);
      expect(result.errorType).toBe("password");
      expect(result.error).toContain("パスワード");
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
        "https://api.example.com/auth/register",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ email: "user@example.com", password: "ValidPassword123" }),
        }),
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

  describe("login", () => {
    it("メールアドレスが無効なとき success: false と errorType: email を返す", async () => {
      const { login } = useAuth();
      const result = await login("invalid-email", "ValidPassword123");
      expect(result.success).toBe(false);
      expect(result.errorType).toBe("email");
    });

    it("パスワードが空のとき success: false と errorType: password を返す", async () => {
      const { login } = useAuth();
      const result = await login("user@example.com", "");
      expect(result.success).toBe(false);
      expect(result.errorType).toBe("password");
    });

    it("API 呼び出しが成功したとき success: true と accessToken を返し、idToken・refreshToken・expiresAt を保存する", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          idToken: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
          refreshToken: "eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIi...",
          tokenType: "Bearer",
          expiresIn: 3600,
        }),
      });

      const { login } = useAuth();
      const result = await login("user@example.com", "ValidPassword123");

      expect(result.success).toBe(true);
      expect(result.accessToken).toBe("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...");
      expect(localStorage.getItem(ID_TOKEN_KEY)).toBe("eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...");
      expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe(
        "eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIi...",
      );
      expect(localStorage.getItem(TOKEN_EXPIRES_AT_KEY)).not.toBeNull();
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/auth/login",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ email: "user@example.com", password: "ValidPassword123" }),
        }),
      );
    });

    it("レスポンスに accessToken がない場合 success: false を返す", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          idToken: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
          tokenType: "Bearer",
        }),
      });

      const { login } = useAuth();
      const result = await login("user@example.com", "ValidPassword123");

      expect(result.success).toBe(false);
      expect(result.errorType).toBe("general");
      expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
    });

    it("レスポンスの accessToken が空文字の場合 success: false を返す", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          accessToken: "   ",
          idToken: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
        }),
      });

      const { login } = useAuth();
      const result = await login("user@example.com", "ValidPassword123");

      expect(result.success).toBe(false);
      expect(result.errorType).toBe("general");
      expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
    });

    it("レスポンスに idToken がない場合 success: false を返す", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          tokenType: "Bearer",
        }),
      });

      const { login } = useAuth();
      const result = await login("user@example.com", "ValidPassword123");

      expect(result.success).toBe(false);
      expect(result.errorType).toBe("general");
      expect(localStorage.getItem(ID_TOKEN_KEY)).toBeNull();
    });

    it("レスポンスの idToken が空文字の場合 success: false を返す", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          idToken: "   ",
        }),
      });

      const { login } = useAuth();
      const result = await login("user@example.com", "ValidPassword123");

      expect(result.success).toBe(false);
      expect(result.errorType).toBe("general");
      expect(localStorage.getItem(ID_TOKEN_KEY)).toBeNull();
    });

    it("レスポンスに refreshToken がない場合 success: false を返す", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          idToken: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
          expiresIn: 3600,
        }),
      });

      const { login } = useAuth();
      const result = await login("user@example.com", "ValidPassword123");

      expect(result.success).toBe(false);
      expect(result.errorType).toBe("general");
    });

    it("レスポンスに expiresIn がない場合 success: false を返す", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          idToken: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
          refreshToken: "eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIi...",
        }),
      });

      const { login } = useAuth();
      const result = await login("user@example.com", "ValidPassword123");

      expect(result.success).toBe(false);
      expect(result.errorType).toBe("general");
    });

    it("認証情報が間違いの場合 success: false とエラーメッセージを返す", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({
          error: "InvalidCredentials",
          message: "Email or password is incorrect.",
        }),
      });

      const { login } = useAuth();
      const result = await login("user@example.com", "ValidPassword123");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Email or password is incorrect.");
    });

    it("ネットワークエラー時に success: false を返す", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      const { login } = useAuth();
      const result = await login("user@example.com", "ValidPassword123");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network error");
    });
  });

  describe("isAdmin", () => {
    const makeIdToken = (payload: Record<string, unknown>): string => {
      const encoded = btoa(JSON.stringify(payload))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
      return `header.${encoded}.signature`;
    };

    it("idToken がないとき false を返す", () => {
      const { isAdmin } = useAuth();
      expect(isAdmin()).toBe(false);
    });

    it("cognito:groups が配列で admin を含むとき true を返す", () => {
      localStorage.setItem(ID_TOKEN_KEY, makeIdToken({ "cognito:groups": ["admin"] }));
      const { isAdmin } = useAuth();
      expect(isAdmin()).toBe(true);
    });

    it("cognito:groups が配列で admin を含まないとき false を返す", () => {
      localStorage.setItem(ID_TOKEN_KEY, makeIdToken({ "cognito:groups": ["viewer"] }));
      const { isAdmin } = useAuth();
      expect(isAdmin()).toBe(false);
    });

    it("cognito:groups がカンマ区切り文字列で admin を含むとき true を返す", () => {
      localStorage.setItem(ID_TOKEN_KEY, makeIdToken({ "cognito:groups": "admin,viewer" }));
      const { isAdmin } = useAuth();
      expect(isAdmin()).toBe(true);
    });

    it("cognito:groups がカンマ区切り文字列で admin を含まないとき false を返す", () => {
      localStorage.setItem(ID_TOKEN_KEY, makeIdToken({ "cognito:groups": "viewer,editor" }));
      const { isAdmin } = useAuth();
      expect(isAdmin()).toBe(false);
    });

    it("cognito:groups クレームがないとき false を返す", () => {
      localStorage.setItem(ID_TOKEN_KEY, makeIdToken({ sub: "user-id" }));
      const { isAdmin } = useAuth();
      expect(isAdmin()).toBe(false);
    });

    it("idToken が不正な形式のとき false を返す", () => {
      localStorage.setItem(ID_TOKEN_KEY, "invalid-token");
      const { isAdmin } = useAuth();
      expect(isAdmin()).toBe(false);
    });
  });

  describe("isAuthenticated", () => {
    it("localStorage に accessToken があるとき true を返す", () => {
      localStorage.setItem("accessToken", "token123");
      const { isAuthenticated } = useAuth();
      expect(isAuthenticated()).toBe(true);
    });

    it("localStorage に accessToken がないとき false を返す", () => {
      const { isAuthenticated } = useAuth();
      expect(isAuthenticated()).toBe(false);
    });
  });

  describe("logout", () => {
    it("localStorage の accessToken が削除される", () => {
      localStorage.setItem("accessToken", "token123");
      const { logout } = useAuth();
      logout();
      expect(localStorage.getItem("accessToken")).toBeNull();
    });

    it("localStorage の idToken が削除される", () => {
      localStorage.setItem(ID_TOKEN_KEY, "id-token-123");
      const { logout } = useAuth();
      logout();
      expect(localStorage.getItem(ID_TOKEN_KEY)).toBeNull();
    });

    it("localStorage の refreshToken と tokenExpiresAt が削除される", () => {
      localStorage.setItem(REFRESH_TOKEN_KEY, "refresh-token-123");
      localStorage.setItem(TOKEN_EXPIRES_AT_KEY, "1234567890");
      const { logout } = useAuth();
      logout();
      expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
      expect(localStorage.getItem(TOKEN_EXPIRES_AT_KEY)).toBeNull();
    });

    it("ログイン画面へナビゲートされる", () => {
      const { logout } = useAuth();
      logout();
      expect(mockRouterPush).toHaveBeenCalledWith("/auth/login");
    });
  });

  describe("isTokenExpired", () => {
    it("tokenExpiresAt が設定されていない場合 true を返す", () => {
      const { isTokenExpired } = useAuth();
      expect(isTokenExpired()).toBe(true);
    });

    it("有効期限が過去の場合 true を返す", () => {
      localStorage.setItem(TOKEN_EXPIRES_AT_KEY, String(Date.now() - 1000));
      const { isTokenExpired } = useAuth();
      expect(isTokenExpired()).toBe(true);
    });

    it("有効期限が未来の場合 false を返す", () => {
      localStorage.setItem(TOKEN_EXPIRES_AT_KEY, String(Date.now() + 60000));
      const { isTokenExpired } = useAuth();
      expect(isTokenExpired()).toBe(false);
    });

    it("tokenExpiresAt が不正な文字列の場合 true を返す", () => {
      localStorage.setItem(TOKEN_EXPIRES_AT_KEY, "invalid-number");
      const { isTokenExpired } = useAuth();
      expect(isTokenExpired()).toBe(true);
    });
  });

  describe("refreshTokens", () => {
    it("refreshToken がない場合 false を返す", async () => {
      const { refreshTokens } = useAuth();
      expect(await refreshTokens()).toBe(false);
    });

    it("リフレッシュ成功時に新しいトークンを保存して true を返す", async () => {
      localStorage.setItem(REFRESH_TOKEN_KEY, "valid-refresh-token");
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          accessToken: "new-access-token",
          idToken: "new-id-token",
          expiresIn: 3600,
        }),
      });

      const { refreshTokens } = useAuth();
      const result = await refreshTokens();

      expect(result).toBe(true);
      expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBe("new-access-token");
      expect(localStorage.getItem(ID_TOKEN_KEY)).toBe("new-id-token");
      expect(localStorage.getItem(TOKEN_EXPIRES_AT_KEY)).not.toBeNull();
    });

    it("リフレッシュ失敗時に false を返す", async () => {
      localStorage.setItem(REFRESH_TOKEN_KEY, "invalid-refresh-token");
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: "InvalidRefreshToken" }),
      });

      const { refreshTokens } = useAuth();
      expect(await refreshTokens()).toBe(false);
    });

    it("レスポンスに expiresIn がない場合 false を返す", async () => {
      localStorage.setItem(REFRESH_TOKEN_KEY, "valid-refresh-token");
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          accessToken: "new-access-token",
          idToken: "new-id-token",
        }),
      });

      const { refreshTokens } = useAuth();
      expect(await refreshTokens()).toBe(false);
    });

    it("ネットワークエラー時に false を返す", async () => {
      localStorage.setItem(REFRESH_TOKEN_KEY, "valid-refresh-token");
      mockFetch.mockRejectedValue(new Error("Network error"));

      const { refreshTokens } = useAuth();
      expect(await refreshTokens()).toBe(false);
    });

    it("リフレッシュ中に clearTokens が呼ばれた場合トークンを書き戻さない", async () => {
      localStorage.setItem(REFRESH_TOKEN_KEY, "valid-refresh-token");

      let resolveFetch: (value: unknown) => void;
      mockFetch.mockReturnValue(
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
      );

      const { refreshTokens, clearTokens } = useAuth();
      const refreshPromise = refreshTokens();

      clearTokens();
      expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();

      resolveFetch!({
        ok: true,
        json: async () => ({
          accessToken: "new-access-token",
          idToken: "new-id-token",
          expiresIn: 3600,
        }),
      });

      const result = await refreshPromise;
      expect(result).toBe(false);
      expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
      expect(localStorage.getItem(ID_TOKEN_KEY)).toBeNull();
      expect(localStorage.getItem(TOKEN_EXPIRES_AT_KEY)).toBeNull();
    });
  });

  describe("verifyEmail", () => {
    it("API 呼び出しが成功したとき success: true を返す", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ message: "Email confirmed successfully." }),
      });

      const { verifyEmail } = useAuth();
      const result = await verifyEmail("user@example.com", "123456");

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/auth/verify-email",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ email: "user@example.com", code: "123456" }),
        }),
      );
    });

    it("CodeMismatch エラー時に success: false と errorType: code_mismatch を返す", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: "CodeMismatch", message: "認証コードが正しくありません" }),
      });

      const { verifyEmail } = useAuth();
      const result = await verifyEmail("user@example.com", "000000");

      expect(result.success).toBe(false);
      expect(result.errorType).toBe("code_mismatch");
    });

    it("ExpiredCode エラー時に success: false と errorType: expired_code を返す", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({
          error: "ExpiredCode",
          message: "認証コードの有効期限が切れています",
        }),
      });

      const { verifyEmail } = useAuth();
      const result = await verifyEmail("user@example.com", "123456");

      expect(result.success).toBe(false);
      expect(result.errorType).toBe("expired_code");
    });

    it("ネットワークエラー時に success: false を返す", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      const { verifyEmail } = useAuth();
      const result = await verifyEmail("user@example.com", "123456");

      expect(result.success).toBe(false);
      expect(result.errorType).toBe("general");
    });
  });

  describe("loginWithGoogle", () => {
    it("Cognito Hosted UI の Google OAuth URL へリダイレクトする", () => {
      const { loginWithGoogle } = useAuth();
      loginWithGoogle();

      expect(globalThis.location.href).toContain(
        "test.auth.ap-northeast-1.amazoncognito.com/oauth2/authorize",
      );
      expect(globalThis.location.href).toContain("identity_provider=Google");
      expect(globalThis.location.href).toContain("response_type=code");
      expect(globalThis.location.href).toContain("client_id=test-client-id");
      expect(globalThis.location.href).toContain("%2Fauth%2Fcallback");
    });
  });

  describe("handleOAuthCallback", () => {
    it("認可コードでトークンエンドポイントを呼び出してトークンを保存する", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: "access-token",
          id_token: "id-token",
          refresh_token: "refresh-token",
          expires_in: 3600,
        }),
      });

      const { handleOAuthCallback } = useAuth();
      await handleOAuthCallback("test-code");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://test.auth.ap-northeast-1.amazoncognito.com/oauth2/token",
        expect.objectContaining({ method: "POST" }),
      );
      expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBe("access-token");
      expect(localStorage.getItem(ID_TOKEN_KEY)).toBe("id-token");
      expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe("refresh-token");
      expect(localStorage.getItem(TOKEN_EXPIRES_AT_KEY)).not.toBeNull();
    });

    it("トークン取得失敗時に success: false を返す", async () => {
      mockFetch.mockResolvedValue({ ok: false });

      const { handleOAuthCallback } = useAuth();
      const result = await handleOAuthCallback("bad-code");
      expect(result.success).toBe(false);
    });

    it("ネットワークエラー時に success: false を返す", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      const { handleOAuthCallback } = useAuth();
      const result = await handleOAuthCallback("code");
      expect(result.success).toBe(false);
    });
  });

  describe("resendVerificationCode", () => {
    it("API 呼び出しが成功したとき success: true を返す", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ message: "Verification code resent." }),
      });

      const { resendVerificationCode } = useAuth();
      const result = await resendVerificationCode("user@example.com");

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/auth/resend-verification-code",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ email: "user@example.com" }),
        }),
      );
    });

    it("API がエラーを返したとき success: false とエラーメッセージを返す", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({
          error: "UserAlreadyConfirmed",
          message: "このアカウントは既に確認済みです",
        }),
      });

      const { resendVerificationCode } = useAuth();
      const result = await resendVerificationCode("user@example.com");

      expect(result.success).toBe(false);
      expect(result.error).toBe("このアカウントは既に確認済みです");
    });

    it("ネットワークエラー時に success: false を返す", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      const { resendVerificationCode } = useAuth();
      const result = await resendVerificationCode("user@example.com");

      expect(result.success).toBe(false);
    });
  });
});
