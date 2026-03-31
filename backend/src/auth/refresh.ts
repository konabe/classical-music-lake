import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { StatusCodes } from "http-status-codes";

import { createHandler, jsonBodyParser } from "../utils/middleware";
import { parseRequestBody } from "../utils/parsing";
import { refreshTokenSchema } from "../utils/schemas";
import { getEnv } from "../utils/env";
import type { CognitoError } from "../types";

const cognito = new CognitoIdentityProviderClient({});

export const handler = createHandler(async (event) => {
  const input = parseRequestBody(event.body as unknown, refreshTokenSchema);

  try {
    const env = getEnv();
    const response = await cognito.send(
      new InitiateAuthCommand({
        AuthFlow: "REFRESH_TOKEN_AUTH",
        ClientId: env.cognitoClientId,
        AuthParameters: {
          REFRESH_TOKEN: input.refreshToken,
        },
      })
    );

    const authResult = response.AuthenticationResult;

    return {
      statusCode: StatusCodes.OK,
      body: {
        accessToken: authResult?.AccessToken,
        idToken: authResult?.IdToken,
        tokenType: authResult?.TokenType ?? "Bearer",
        expiresIn: authResult?.ExpiresIn,
      },
    };
  } catch (error) {
    const cognitoError = error as CognitoError;

    if (cognitoError.name === "NotAuthorizedException") {
      return {
        statusCode: StatusCodes.UNAUTHORIZED,
        body: {
          error: "InvalidRefreshToken",
          message: "Refresh token is invalid or expired. Please login again.",
        },
      };
    }

    if (cognitoError.name === "TooManyRequestsException") {
      return {
        statusCode: StatusCodes.TOO_MANY_REQUESTS,
        body: {
          error: "TooManyRequests",
          message: "Too many requests. Please try again later.",
        },
      };
    }

    throw error;
  }
}).use(jsonBodyParser);
