import * as cognitoAuthRepository from "../../repositories/cognito-auth-repository";
import { mapCognitoError } from "../../domain/auth-error";
import type { CognitoError } from "../../types";

export const loginUser = async (email: string, password: string) => {
  try {
    const tokens = await cognitoAuthRepository.initiateAuth(email, password);
    return { success: true as const, body: tokens };
  } catch (error) {
    const mapped = mapCognitoError((error as CognitoError).name, "login");
    if (mapped !== undefined) {
      return { success: false as const, ...mapped };
    }
    throw error;
  }
};
