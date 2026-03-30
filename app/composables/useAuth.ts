import { useRouter } from "#app";
import { useApiBase } from "./useApiBase";

export const ACCESS_TOKEN_KEY = "accessToken";
export const ID_TOKEN_KEY = "idToken";
export const REFRESH_TOKEN_KEY = "refreshToken";
export const TOKEN_EXPIRES_AT_KEY = "tokenExpiresAt";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_UPPERCASE_REGEX = /[A-Z]/;
const PASSWORD_LOWERCASE_REGEX = /[a-z]/;
const PASSWORD_DIGIT_REGEX = /\d/;

export interface RegisterResult {
  success: boolean;
  error?: string;
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

  const validateEmail = (email: string): boolean => {
    if (email === "" || email.trim() === "") return false;
    return EMAIL_REGEX.test(email.trim());
  };

  const validatePassword = (password: string): boolean => {
    if (password === "") return false;
    if (password.length < PASSWORD_MIN_LENGTH) return false;
    if (!PASSWORD_UPPERCASE_REGEX.test(password)) return false;
    if (!PASSWORD_LOWERCASE_REGEX.test(password)) return false;
    if (!PASSWORD_DIGIT_REGEX.test(password)) return false;
    return true;
  };

  const getPasswordValidationError = (password: string): string | null => {
    if (password === "") {
      return "Password is required";
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
      return `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`;
    }
    if (!PASSWORD_UPPERCASE_REGEX.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!PASSWORD_LOWERCASE_REGEX.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!PASSWORD_DIGIT_REGEX.test(password)) {
      return "Password must contain at least one digit";
    }
    return null;
  };

  const register = async (email: string, password: string): Promise<RegisterResult> => {
    if (!validateEmail(email)) {
      return {
        success: false,
        error: "Please enter a valid email address",
      };
    }

    const passwordError = getPasswordValidationError(password);
    if (passwordError !== null) {
      return {
        success: false,
        error: passwordError,
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
          error: errorData.message ?? "Registration failed. Please try again.",
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "A network error occurred. Please try again.",
      };
    }
  };

  const login = async (email: string, password: string): Promise<LoginResult> => {
    if (!validateEmail(email)) {
      return {
        success: false,
        error: "Please enter a valid email address",
        errorType: "email",
      };
    }

    if (password === "") {
      return {
        success: false,
        error: "Password is required",
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
          error: errorData.message ?? "Login failed. Please try again.",
          errorType,
        };
      }

      const data = await response.json();
      if (typeof data.accessToken !== "string" || data.accessToken.trim() === "") {
        return {
          success: false,
          error: "Invalid session data received. Please try again.",
          errorType: "general",
        };
      }
      if (typeof data.idToken !== "string" || data.idToken.trim() === "") {
        return {
          success: false,
          error: "Invalid session data received. Please try again.",
          errorType: "general",
        };
      }
      try {
        localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
        localStorage.setItem(ID_TOKEN_KEY, data.idToken);
        if (typeof data.refreshToken === "string" && data.refreshToken.trim() !== "") {
          localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
        }
        if (typeof data.expiresIn === "number") {
          const expiresAt = Date.now() + data.expiresIn * 1000;
          localStorage.setItem(TOKEN_EXPIRES_AT_KEY, String(expiresAt));
        }
      } catch {
        return {
          success: false,
          error: "Failed to save session. Please try again.",
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
          error instanceof Error ? error.message : "A network error occurred. Please try again.",
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
          error: errorData.message ?? "Verification failed. Please try again.",
          errorType,
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "A network error occurred. Please try again.",
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
          error: errorData.message ?? "Failed to resend verification code. Please try again.",
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "A network error occurred. Please try again.",
      };
    }
  };

  const isTokenExpired = (): boolean => {
    const expiresAt = localStorage.getItem(TOKEN_EXPIRES_AT_KEY);
    if (expiresAt === null) return true;
    return Date.now() >= Number(expiresAt);
  };

  const refreshTokens = async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (refreshToken === null) return false;

    try {
      const response = await fetch(`${apiBase}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      if (typeof data.accessToken !== "string" || data.accessToken.trim() === "") return false;
      if (typeof data.idToken !== "string" || data.idToken.trim() === "") return false;

      localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
      localStorage.setItem(ID_TOKEN_KEY, data.idToken);
      if (typeof data.expiresIn === "number") {
        const expiresAt = Date.now() + data.expiresIn * 1000;
        localStorage.setItem(TOKEN_EXPIRES_AT_KEY, String(expiresAt));
      }
      return true;
    } catch {
      return false;
    }
  };

  const isAuthenticated = (): boolean => {
    return localStorage.getItem(ACCESS_TOKEN_KEY) !== null;
  };

  const logout = (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(ID_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRES_AT_KEY);
    router.push("/auth/login");
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
    isTokenExpired,
    refreshTokens,
    logout,
  };
};
