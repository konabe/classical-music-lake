import * as cognitoAuthRepository from "../../repositories/cognito-auth-repository";
import { mapCognitoError } from "../../domain/auth-error";
import type { CognitoError } from "../../types";

export const registerUser = async (email: string, password: string) => {
  try {
    await cognitoAuthRepository.signUp(email, password);
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
};
