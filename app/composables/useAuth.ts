import { useApiBase } from "./useApiBase";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_UPPERCASE_REGEX = /[A-Z]/;
const PASSWORD_LOWERCASE_REGEX = /[a-z]/;
const PASSWORD_DIGIT_REGEX = /\d/;

export interface RegisterResult {
  success: boolean;
  error?: string;
}

export interface LoginResult {
  success: boolean;
  accessToken?: string;
  error?: string;
}

export const useAuth = () => {
  const validateEmail = (email: string): boolean => {
    if (!email || !email.trim()) return false;
    return EMAIL_REGEX.test(email.trim());
  };

  const validatePassword = (password: string): boolean => {
    if (!password) return false;
    if (password.length < PASSWORD_MIN_LENGTH) return false;
    if (!PASSWORD_UPPERCASE_REGEX.test(password)) return false;
    if (!PASSWORD_LOWERCASE_REGEX.test(password)) return false;
    if (!PASSWORD_DIGIT_REGEX.test(password)) return false;
    return true;
  };

  const getPasswordValidationError = (password: string): string | null => {
    if (!password) {
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
    // Client-side validation
    if (!validateEmail(email)) {
      return {
        success: false,
        error: "Please enter a valid email address",
      };
    }

    const passwordError = getPasswordValidationError(password);
    if (passwordError) {
      return {
        success: false,
        error: passwordError,
      };
    }

    try {
      const apiBase = useApiBase();

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
          error: errorData.message || "Registration failed. Please try again.",
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
      };
    }

    if (!password) {
      return {
        success: false,
        error: "Password is required",
      };
    }

    try {
      const apiBase = useApiBase();

      const response = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || "Login failed. Please try again.",
        };
      }

      const data = await response.json();
      localStorage.setItem("accessToken", data.accessToken);

      return {
        success: true,
        accessToken: data.accessToken,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "A network error occurred. Please try again.",
      };
    }
  };

  return {
    validateEmail,
    validatePassword,
    getPasswordValidationError,
    register,
    login,
  };
};
