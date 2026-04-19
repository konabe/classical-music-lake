import { mapCognitoError } from "../domain/auth-error";
import type { AuthRepository } from "../domain/auth";
import { CognitoAuthRepository } from "../repositories/cognito-auth-repository";
import type { CognitoError } from "../types";

const providerNameMap: Record<string, string> = {
  google: "Google",
};

export class AuthUsecase {
  constructor(private readonly repo: AuthRepository) {}

  async login(email: string, password: string) {
    try {
      const tokens = await this.repo.initiateAuth(email, password);
      return { success: true as const, body: tokens };
    } catch (error) {
      const mapped = mapCognitoError((error as CognitoError).name, "login");
      if (mapped !== undefined) {
        return { success: false as const, ...mapped };
      }
      throw error;
    }
  }

  async register(email: string, password: string) {
    try {
      await this.repo.signUp(email, password);
      return {
        success: true as const,
        body: {
          message: "User created successfully. Please check your email to verify your account.",
        },
      };
    } catch (error) {
      const mapped = mapCognitoError((error as CognitoError).name, "register");
      if (mapped !== undefined) {
        return { success: false as const, ...mapped };
      }
      throw error;
    }
  }

  async verifyEmail(email: string, code: string) {
    try {
      await this.repo.confirmSignUp(email, code);
      return { success: true as const, body: { message: "Email confirmed successfully." } };
    } catch (error) {
      const mapped = mapCognitoError((error as CognitoError).name, "verify");
      if (mapped !== undefined) {
        return { success: false as const, ...mapped };
      }
      return {
        success: false as const,
        statusCode: 500,
        body: { message: "Internal server error" },
      };
    }
  }

  async refreshToken(token: string) {
    try {
      const tokens = await this.repo.refreshToken(token);
      return { success: true as const, body: tokens };
    } catch (error) {
      const mapped = mapCognitoError((error as CognitoError).name, "refresh");
      if (mapped !== undefined) {
        return { success: false as const, ...mapped };
      }
      throw error;
    }
  }

  async resendVerificationCode(email: string) {
    try {
      await this.repo.resendConfirmationCode(email);
      return {
        success: true as const,
        body: { message: "Verification code resent. Please check your email." },
      };
    } catch (error) {
      const mapped = mapCognitoError((error as CognitoError).name, "resend");
      if (mapped !== undefined) {
        return { success: false as const, ...mapped };
      }
      return {
        success: false as const,
        statusCode: 500,
        body: { message: "Internal server error" },
      };
    }
  }

  async linkExternalProvider(
    userPoolId: string,
    email: string,
    userName: string
  ): Promise<boolean> {
    const users = await this.repo.listUsersByEmail(userPoolId, email);
    const existingUser = users.find((u) => {
      return u.status === "CONFIRMED";
    });

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
      providerUserId
    );

    return true;
  }
}

export const createAuthUsecase = () => {
  return new AuthUsecase(new CognitoAuthRepository());
};
