import { StatusCodes } from "http-status-codes";

import { mapCognitoError } from "@/domain/auth-error";
import type { AuthContext } from "@/domain/auth-error";
import type { AuthRepository } from "@/domain/auth";
import { CognitoAuthRepository } from "@/repositories/cognito-auth-repository";
import type { CognitoError } from "@/types";

const providerNameMap: Record<string, string> = {
  google: "Google",
};

export type AuthResponse = { statusCode: number; body: unknown };

// Cognito 呼び出しのエラーをコンテキスト別にマッピングし、共通レスポンス形式に整える。
// マッピング対象外のエラーは throw して middleware の 500 ハンドリングへ委ねる。
const tryCognito = async <T>(
  context: AuthContext,
  successCode: number,
  successBodyFactory: (result: T) => unknown,
  fn: () => Promise<T>,
): Promise<AuthResponse> => {
  try {
    const result = await fn();
    return { statusCode: successCode, body: successBodyFactory(result) };
  } catch (error) {
    const mapped = mapCognitoError((error as CognitoError).name, context);
    if (mapped !== undefined) {
      return mapped;
    }
    throw error;
  }
};

export class AuthUsecase {
  constructor(private readonly repo: AuthRepository) {}

  login(email: string, password: string): Promise<AuthResponse> {
    return tryCognito(
      "login",
      StatusCodes.OK,
      (tokens) => tokens,
      () => this.repo.initiateAuth(email, password),
    );
  }

  register(email: string, password: string): Promise<AuthResponse> {
    return tryCognito(
      "register",
      StatusCodes.CREATED,
      () => ({
        message: "User created successfully. Please check your email to verify your account.",
      }),
      () => this.repo.signUp(email, password),
    );
  }

  verifyEmail(email: string, code: string): Promise<AuthResponse> {
    return tryCognito(
      "verify",
      StatusCodes.OK,
      () => ({ message: "Email confirmed successfully." }),
      () => this.repo.confirmSignUp(email, code),
    );
  }

  refreshToken(token: string): Promise<AuthResponse> {
    return tryCognito(
      "refresh",
      StatusCodes.OK,
      (tokens) => tokens,
      () => this.repo.refreshToken(token),
    );
  }

  resendVerificationCode(email: string): Promise<AuthResponse> {
    return tryCognito(
      "resend",
      StatusCodes.OK,
      () => ({ message: "Verification code resent. Please check your email." }),
      () => this.repo.resendConfirmationCode(email),
    );
  }

  async linkExternalProvider(
    userPoolId: string,
    email: string,
    userName: string,
  ): Promise<boolean> {
    const users = await this.repo.listUsersByEmail(userPoolId, email);
    const existingUser = users.find((u) => u.status === "CONFIRMED");

    if (existingUser === undefined) {
      return false;
    }

    const underscoreIndex = userName.indexOf("_");
    const rawProviderName = userName.substring(0, underscoreIndex);
    const providerName = providerNameMap[rawProviderName];
    if (providerName === undefined) {
      return false;
    }
    const providerUserId = userName.substring(underscoreIndex + 1);

    await this.repo.linkProviderForUser(
      userPoolId,
      existingUser.username,
      providerName,
      providerUserId,
    );

    return true;
  }
}

export const createAuthUsecase = () => new AuthUsecase(new CognitoAuthRepository());
