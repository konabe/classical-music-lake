import { useRouter } from "#app";
import { useApiBase } from "./useApiBase";
import { useCognitoConfig } from "./useCognitoConfig";

const ADMIN_GROUP_NAME = "admin";

const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padding = (4 - (base64.length % 4)) % 4;
    return JSON.parse(atob(base64 + "=".repeat(padding))) as Record<string, unknown>;
  } catch {
    return null;
  }
};

export const ACCESS_TOKEN_KEY = "accessToken";
export const ID_TOKEN_KEY = "idToken";
export const REFRESH_TOKEN_KEY = "refreshToken";
export const TOKEN_EXPIRES_AT_KEY = "tokenExpiresAt";

const MILLISECONDS_PER_SECOND = 1000;
let refreshInFlight: Promise<boolean> | null = null;
let refreshGeneration = 0;

const saveSessionTokens = (accessToken: string, idToken: string, expiresIn: number): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(ID_TOKEN_KEY, idToken);
  const expiresAt = Date.now() + expiresIn * MILLISECONDS_PER_SECOND;
  localStorage.setItem(TOKEN_EXPIRES_AT_KEY, String(expiresAt));
};
const EMAIL_REGEX = /^[^\s@]{1,64}@[^\s@]{1,255}$/;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_UPPERCASE_REGEX = /[A-Z]/;
const PASSWORD_LOWERCASE_REGEX = /[a-z]/;
const PASSWORD_DIGIT_REGEX = /\d/;

export type RegisterErrorType = "email" | "password" | "general";

export interface RegisterResult {
  success: boolean;
  error?: string;
  errorType?: RegisterErrorType;
}

export type LoginErrorType = "email" | "password" | "credentials" | "not_confirmed" | "general";

export type VerifyEmailErrorType =
  | "code_mismatch"
  | "expired_code"
  | "already_confirmed"
  | "too_many_requests"
  | "general";

export type VerifyEmailResult = {
  success: boolean;
  error?: string;
  errorType?: VerifyEmailErrorType;
};

export type ResendCodeResult = {
  success: boolean;
  error?: string;
};

const VERIFY_EMAIL_ERROR_TYPE_MAP: Record<string, VerifyEmailErrorType> = {
  CodeMismatch: "code_mismatch",
  ExpiredCode: "expired_code",
  NotAuthorized: "already_confirmed",
  TooManyRequests: "too_many_requests",
};

export interface LoginResult {
  success: boolean;
  accessToken?: string;
  error?: string;
  errorType?: LoginErrorType;
}

export const useAuth = () => {
  const apiBase = useApiBase();
  const router = useRouter();
  const { domain: cognitoDomain, clientId: cognitoClientId } = useCognitoConfig();

  const validateEmail = (email: string): boolean => {
    if (email === "" || email.trim() === "") {
      return false;
    }
    return EMAIL_REGEX.test(email.trim());
  };

  const validatePassword = (password: string): boolean => {
    if (password === "") {
      return false;
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
      return false;
    }
    if (!PASSWORD_UPPERCASE_REGEX.test(password)) {
      return false;
    }
    if (!PASSWORD_LOWERCASE_REGEX.test(password)) {
      return false;
    }
    if (!PASSWORD_DIGIT_REGEX.test(password)) {
      return false;
    }
    return true;
  };

  const getPasswordValidationError = (password: string): string | null => {
    if (password === "") {
      return "パスワードを入力してください";
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
      return `パスワードは${PASSWORD_MIN_LENGTH}文字以上で入力してください`;
    }
    if (!PASSWORD_UPPERCASE_REGEX.test(password)) {
      return "パスワードには大文字を1文字以上含めてください";
    }
    if (!PASSWORD_LOWERCASE_REGEX.test(password)) {
      return "パスワードには小文字を1文字以上含めてください";
    }
    if (!PASSWORD_DIGIT_REGEX.test(password)) {
      return "パスワードには数字を1文字以上含めてください";
    }
    return null;
  };

  const register = async (email: string, password: string): Promise<RegisterResult> => {
    if (!validateEmail(email)) {
      return {
        success: false,
        error: "有効なメールアドレスを入力してください",
        errorType: "email",
      };
    }

    const passwordError = getPasswordValidationError(password);
    if (passwordError !== null) {
      return {
        success: false,
        error: passwordError,
        errorType: "password",
      };
    }

    try {
      const response = await fetch(`${apiBase}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message ?? "登録に失敗しました。時間をおいて再度お試しください",
          errorType: "general",
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "ネットワークエラーが発生しました。時間をおいて再度お試しください",
        errorType: "general",
      };
    }
  };

  const login = async (email: string, password: string): Promise<LoginResult> => {
    if (!validateEmail(email)) {
      return {
        success: false,
        error: "有効なメールアドレスを入力してください",
        errorType: "email",
      };
    }

    if (password === "") {
      return {
        success: false,
        error: "パスワードを入力してください",
        errorType: "password",
      };
    }

    try {
      const response = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorType: LoginErrorType =
          errorData.error === "UserNotConfirmed" ? "not_confirmed" : "credentials";
        return {
          success: false,
          error: errorData.message ?? "ログインに失敗しました。時間をおいて再度お試しください",
          errorType,
        };
      }

      const data = await response.json();
      if (typeof data.accessToken !== "string" || data.accessToken.trim() === "") {
        return {
          success: false,
          error: "セッション情報の取得に失敗しました。時間をおいて再度お試しください",
          errorType: "general",
        };
      }
      if (typeof data.idToken !== "string" || data.idToken.trim() === "") {
        return {
          success: false,
          error: "セッション情報の取得に失敗しました。時間をおいて再度お試しください",
          errorType: "general",
        };
      }
      if (typeof data.refreshToken !== "string" || data.refreshToken.trim() === "") {
        return {
          success: false,
          error: "セッション情報の取得に失敗しました。時間をおいて再度お試しください",
          errorType: "general",
        };
      }
      if (typeof data.expiresIn !== "number") {
        return {
          success: false,
          error: "セッション情報の取得に失敗しました。時間をおいて再度お試しください",
          errorType: "general",
        };
      }
      try {
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
        saveSessionTokens(data.accessToken, data.idToken, data.expiresIn);
      } catch {
        return {
          success: false,
          error: "セッションの保存に失敗しました。時間をおいて再度お試しください",
          errorType: "general",
        };
      }

      return {
        success: true,
        accessToken: data.accessToken,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "ネットワークエラーが発生しました。時間をおいて再度お試しください",
        errorType: "general",
      };
    }
  };

  const verifyEmail = async (email: string, code: string): Promise<VerifyEmailResult> => {
    try {
      const response = await fetch(`${apiBase}/auth/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorType: VerifyEmailErrorType =
          VERIFY_EMAIL_ERROR_TYPE_MAP[errorData.error] ?? "general";
        return {
          success: false,
          error: errorData.message ?? "確認に失敗しました。時間をおいて再度お試しください",
          errorType,
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "ネットワークエラーが発生しました。時間をおいて再度お試しください",
        errorType: "general",
      };
    }
  };

  const resendVerificationCode = async (email: string): Promise<ResendCodeResult> => {
    try {
      const response = await fetch(`${apiBase}/auth/resend-verification-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error:
            errorData.message ?? "確認コードの再送信に失敗しました。時間をおいて再度お試しください",
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "ネットワークエラーが発生しました。時間をおいて再度お試しください",
      };
    }
  };

  const isTokenExpired = (): boolean => {
    const expiresAt = localStorage.getItem(TOKEN_EXPIRES_AT_KEY);
    if (expiresAt === null) {
      return true;
    }
    const parsedExpiresAt = Number(expiresAt);
    if (!Number.isFinite(parsedExpiresAt)) {
      return true;
    }
    return Date.now() >= parsedExpiresAt;
  };

  const doRefresh = async (): Promise<boolean> => {
    const generation = refreshGeneration;
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (refreshToken === null) {
      return false;
    }

    try {
      const response = await fetch(`${apiBase}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      if (typeof data.accessToken !== "string" || data.accessToken.trim() === "") {
        return false;
      }
      if (typeof data.idToken !== "string" || data.idToken.trim() === "") {
        return false;
      }
      if (typeof data.expiresIn !== "number") {
        return false;
      }

      if (generation !== refreshGeneration) {
        return false;
      }
      saveSessionTokens(data.accessToken, data.idToken, data.expiresIn);
      return true;
    } catch {
      return false;
    }
  };

  const refreshTokens = (): Promise<boolean> => {
    if (refreshInFlight !== null) {
      return refreshInFlight;
    }
    refreshInFlight = doRefresh().finally(() => {
      refreshInFlight = null;
    });
    return refreshInFlight;
  };

  const isAuthenticated = (): boolean => {
    return localStorage.getItem(ACCESS_TOKEN_KEY) !== null;
  };

  const isAdmin = (): boolean => {
    const idToken = localStorage.getItem(ID_TOKEN_KEY);
    if (idToken === null) {
      return false;
    }
    const payload = decodeJwtPayload(idToken);
    if (payload === null) {
      return false;
    }
    const groups = payload["cognito:groups"];
    if (Array.isArray(groups)) {
      return groups.includes(ADMIN_GROUP_NAME);
    }
    if (typeof groups === "string" && groups !== "") {
      return groups
        .split(",")
        .map((g) => g.trim())
        .includes(ADMIN_GROUP_NAME);
    }
    return false;
  };

  const clearTokens = (): void => {
    refreshGeneration++;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(ID_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRES_AT_KEY);
  };

  const logout = (): void => {
    clearTokens();
    router.push("/auth/login");
  };

  const loginWithGoogle = (): void => {
    const redirectUri = `${globalThis.location.origin}/auth/callback`;
    const url = new URL(`https://${cognitoDomain}/oauth2/authorize`);
    url.searchParams.set("identity_provider", "Google");
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", cognitoClientId);
    url.searchParams.set("scope", "email openid profile");
    globalThis.location.href = url.toString();
  };

  const handleOAuthCallback = async (
    code: string,
  ): Promise<{ success: boolean; error?: string }> => {
    const redirectUri = `${globalThis.location.origin}/auth/callback`;
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: cognitoClientId,
      code,
      redirect_uri: redirectUri,
    });

    try {
      const response = await fetch(`https://${cognitoDomain}/oauth2/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      if (!response.ok) {
        return { success: false, error: "Token exchange failed" };
      }

      const data = await response.json();
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
      saveSessionTokens(data.access_token, data.id_token, data.expires_in);
      return { success: true };
    } catch {
      return { success: false, error: "Network error" };
    }
  };

  return {
    validateEmail,
    validatePassword,
    getPasswordValidationError,
    register,
    login,
    verifyEmail,
    resendVerificationCode,
    isAuthenticated,
    isAdmin,
    isTokenExpired,
    refreshTokens,
    clearTokens,
    logout,
    loginWithGoogle,
    handleOAuthCallback,
  };
};
