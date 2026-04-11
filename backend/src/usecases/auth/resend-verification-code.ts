import * as cognitoAuthRepository from "../../repositories/cognito-auth-repository";
import { mapCognitoError } from "../../domain/auth-error";
import type { CognitoError } from "../../types";

export const resendVerificationCode = async (email: string) => {
  try {
    await cognitoAuthRepository.resendConfirmationCode(email);
    return {
      success: true as const,
      body: { message: "Verification code resent. Please check your email." },
    };
  } catch (error) {
    const mapped = mapCognitoError((error as CognitoError).name, "resend");
    if (mapped !== undefined) {
      return { success: false as const, ...mapped };
    }
    return { success: false as const, statusCode: 500, body: { message: "Internal server error" } };
  }
};
