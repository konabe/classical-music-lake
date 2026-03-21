import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { StatusCodes } from "http-status-codes";

import { createHandler, jsonBodyParser } from "../utils/middleware";
import { parseRequestBody } from "../utils/parsing";
import { loginSchema } from "../utils/schemas";
import type { CognitoError } from "../types";

const cognito = new CognitoIdentityProviderClient({});
const clientId = process.env.COGNITO_CLIENT_ID || "";

export const handler = createHandler(async (event) => {
  const input = parseRequestBody(event.body as unknown, loginSchema);

  try {
    const response = await cognito.send(
      new InitiateAuthCommand({
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: clientId,
        AuthParameters: {
          USERNAME: input.email,
          PASSWORD: input.password,
        },
      })
    );

    const authResult = response.AuthenticationResult;

    return {
      statusCode: StatusCodes.OK,
      body: {
        accessToken: authResult?.AccessToken,
        tokenType: authResult?.TokenType ?? "Bearer",
        expiresIn: authResult?.ExpiresIn,
      },
    };
  } catch (error) {
    const cognitoError = error as CognitoError;

    if (
      cognitoError.name === "NotAuthorizedException" ||
      cognitoError.name === "UserNotFoundException"
    ) {
      return {
        statusCode: StatusCodes.UNAUTHORIZED,
        body: {
          error: "InvalidCredentials",
          message: "Email or password is incorrect.",
        },
      };
    }

    if (cognitoError.name === "UserNotConfirmedException") {
      return {
        statusCode: StatusCodes.FORBIDDEN,
        body: {
          error: "UserNotConfirmed",
          message: "User account is not confirmed. Please verify your email.",
        },
      };
    }

    if (cognitoError.name === "TooManyRequestsException") {
      return {
        statusCode: StatusCodes.TOO_MANY_REQUESTS,
        body: {
          error: "TooManyRequests",
          message: "Too many login attempts. Please try again later.",
        },
      };
    }

    throw error;
  }
}).use(jsonBodyParser);
