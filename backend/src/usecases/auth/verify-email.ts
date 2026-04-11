import * as cognitoAuthRepository from "../../repositories/cognito-auth-repository";
import { mapCognitoError } from "../../domain/auth-error";
import type { CognitoError } from "../../types";

export const verifyEmail = async (email: string, code: string) => {
  try {
    await cognitoAuthRepository.confirmSignUp(email, code);
    return { success: true as const, body: { message: "Email confirmed successfully." } };
  } catch (error) {
    const mapped = mapCognitoError((error as CognitoError).name, "verify");
    if (mapped !== undefined) {
      return { success: false as const, ...mapped };
    }
    return { success: false as const, statusCode: 500, body: { message: "Internal server error" } };
  }
};
