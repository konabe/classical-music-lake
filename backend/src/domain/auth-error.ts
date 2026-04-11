import { StatusCodes } from "http-status-codes";

type AuthErrorResponse = {
  statusCode: number;
  body: { error: string; message: string };
};

type CognitoErrorName =
  | "UsernameExistsException"
  | "InvalidPasswordException"
  | "NotAuthorizedException"
  | "UserNotFoundException"
  | "UserNotConfirmedException"
  | "CodeMismatchException"
  | "ExpiredCodeException"
  | "InvalidParameterException"
  | "TooManyRequestsException";

const errorMap: Record<string, AuthErrorResponse> = {
  // register
  UsernameExistsException: {
    statusCode: StatusCodes.BAD_REQUEST,
    body: { error: "UserExists", message: "An account with the given email already exists." },
  },
  InvalidPasswordException: {
    statusCode: StatusCodes.BAD_REQUEST,
    body: {
      error: "InvalidPassword",
      message:
        "Password does not meet the requirements. Password must be at least 8 characters long and contain uppercase, lowercase, and numeric characters.",
    },
  },
  // login
  NotAuthorizedException_login: {
    statusCode: StatusCodes.UNAUTHORIZED,
    body: { error: "InvalidCredentials", message: "Email or password is incorrect." },
  },
  UserNotFoundException_login: {
    statusCode: StatusCodes.UNAUTHORIZED,
    body: { error: "InvalidCredentials", message: "Email or password is incorrect." },
  },
  UserNotConfirmedException: {
    statusCode: StatusCodes.FORBIDDEN,
    body: {
      error: "UserNotConfirmed",
      message: "User account is not confirmed. Please verify your email.",
    },
  },
  // verify-email
  CodeMismatchException: {
    statusCode: StatusCodes.BAD_REQUEST,
    body: {
      error: "CodeMismatch",
      message: "The confirmation code is incorrect. Please try again.",
    },
  },
  ExpiredCodeException: {
    statusCode: StatusCodes.BAD_REQUEST,
    body: {
      error: "ExpiredCode",
      message: "The confirmation code has expired. Please request a new one.",
    },
  },
  NotAuthorizedException_verify: {
    statusCode: StatusCodes.BAD_REQUEST,
    body: {
      error: "NotAuthorized",
      message: "This account cannot be confirmed. It may already be confirmed.",
    },
  },
  // refresh
  NotAuthorizedException_refresh: {
    statusCode: StatusCodes.UNAUTHORIZED,
    body: {
      error: "InvalidRefreshToken",
      message: "Refresh token is invalid or expired. Please login again.",
    },
  },
  // resend-verification-code
  InvalidParameterException: {
    statusCode: StatusCodes.BAD_REQUEST,
    body: { error: "UserAlreadyConfirmed", message: "This account is already confirmed." },
  },
  UserNotFoundException_resend: {
    statusCode: StatusCodes.BAD_REQUEST,
    body: { error: "UserNotFound", message: "No account found with this email address." },
  },
  // common
  TooManyRequestsException: {
    statusCode: StatusCodes.TOO_MANY_REQUESTS,
    body: { error: "TooManyRequests", message: "Too many attempts. Please try again later." },
  },
};

export type AuthContext = "register" | "login" | "verify" | "refresh" | "resend";

export const mapCognitoError = (
  errorName: string,
  context: AuthContext
): AuthErrorResponse | undefined => {
  // TooManyRequestsException は全コンテキスト共通
  if (errorName === "TooManyRequestsException") {
    const mapped = errorMap[errorName];
    if (context === "register") {
      return {
        ...mapped,
        body: {
          ...mapped.body,
          message: "Too many registration attempts. Please try again later.",
        },
      };
    }
    if (context === "login") {
      return {
        ...mapped,
        body: { ...mapped.body, message: "Too many login attempts. Please try again later." },
      };
    }
    if (context === "refresh") {
      return {
        ...mapped,
        body: { ...mapped.body, message: "Too many requests. Please try again later." },
      };
    }
    return mapped;
  }

  // コンテキスト別のマッピング
  const contextKey = `${errorName}_${context}` as CognitoErrorName | string;
  if (errorMap[contextKey] !== undefined) {
    return errorMap[contextKey];
  }

  // コンテキスト不要なマッピング
  if (errorMap[errorName] !== undefined) {
    return errorMap[errorName];
  }

  return undefined;
};
