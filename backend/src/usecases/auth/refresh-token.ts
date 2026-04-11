import * as cognitoAuthRepository from "../../repositories/cognito-auth-repository";
import { mapCognitoError } from "../../domain/auth-error";
import type { CognitoError } from "../../types";

export const refreshToken = async (token: string) => {
  try {
    const tokens = await cognitoAuthRepository.refreshToken(token);
    return { success: true as const, body: tokens };
  } catch (error) {
    const mapped = mapCognitoError((error as CognitoError).name, "refresh");
    if (mapped !== undefined) {
      return { success: false as const, ...mapped };
    }
    throw error;
  }
};
