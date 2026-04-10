import {
  CognitoIdentityProviderClient,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import { createHandler, jsonBodyParser } from "../utils/middleware";
import { parseRequestBody } from "../utils/parsing";
import { registerSchema } from "../utils/schemas";
import { getEnv } from "../utils/env";
import { created, badRequest, tooManyRequests } from "../utils/response";
import type { CognitoError } from "../types";

const cognito = new CognitoIdentityProviderClient({});

export const handler = createHandler(async (event) => {
  const input = parseRequestBody(event.body as unknown, registerSchema);

  try {
    const env = getEnv();
    await cognito.send(
      new SignUpCommand({
        ClientId: env.cognitoClientId,
        Username: input.email,
        Password: input.password,
        UserAttributes: [
          {
            Name: "email",
            Value: input.email,
          },
        ],
      })
    );

    return created({
      message: "User created successfully. Please check your email to verify your account.",
    });
  } catch (error) {
    const cognitoError = error as CognitoError;

    if (cognitoError.name === "UsernameExistsException") {
      return badRequest("UserExists", "An account with the given email already exists.");
    }

    if (cognitoError.name === "InvalidPasswordException") {
      return badRequest(
        "InvalidPassword",
        "Password does not meet the requirements. Password must be at least 8 characters long and contain uppercase, lowercase, and numeric characters."
      );
    }

    if (cognitoError.name === "TooManyRequestsException") {
      return tooManyRequests("Too many registration attempts. Please try again later.");
    }

    throw error;
  }
}).use(jsonBodyParser);
