import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import { createHandler, jsonBodyParser } from "../utils/middleware";
import { parseRequestBody } from "../utils/parsing";
import { loginSchema } from "../utils/schemas";
import { getEnv } from "../utils/env";
import { ok, unauthorized, forbidden, tooManyRequests } from "../utils/response";
import type { CognitoError } from "../types";

const cognito = new CognitoIdentityProviderClient({});

export const handler = createHandler(async (event) => {
  const input = parseRequestBody(event.body as unknown, loginSchema);

  try {
    const env = getEnv();
    const response = await cognito.send(
      new InitiateAuthCommand({
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: env.cognitoClientId,
        AuthParameters: {
          USERNAME: input.email,
          PASSWORD: input.password,
        },
      })
    );

    const authResult = response.AuthenticationResult;

    return ok({
      accessToken: authResult?.AccessToken,
      idToken: authResult?.IdToken,
      refreshToken: authResult?.RefreshToken,
      tokenType: authResult?.TokenType ?? "Bearer",
      expiresIn: authResult?.ExpiresIn,
    });
  } catch (error) {
    const cognitoError = error as CognitoError;

    if (
      cognitoError.name === "NotAuthorizedException" ||
      cognitoError.name === "UserNotFoundException"
    ) {
      return unauthorized("InvalidCredentials", "Email or password is incorrect.");
    }

    if (cognitoError.name === "UserNotConfirmedException") {
      return forbidden(
        "UserNotConfirmed",
        "User account is not confirmed. Please verify your email."
      );
    }

    if (cognitoError.name === "TooManyRequestsException") {
      return tooManyRequests("Too many login attempts. Please try again later.");
    }

    throw error;
  }
}).use(jsonBodyParser);
