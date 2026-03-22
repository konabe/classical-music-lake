import {
  CognitoIdentityProviderClient,
  ResendConfirmationCodeCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { StatusCodes } from "http-status-codes";

import { createHandler, jsonBodyParser } from "../utils/middleware";
import { parseRequestBody } from "../utils/parsing";
import { resendVerificationCodeSchema } from "../utils/schemas";
import type { CognitoError } from "../types";

const cognito = new CognitoIdentityProviderClient({});
const clientId = process.env.COGNITO_CLIENT_ID || "";

export const handler = createHandler(async (event) => {
  const input = parseRequestBody(event.body as unknown, resendVerificationCodeSchema);

  try {
    await cognito.send(
      new ResendConfirmationCodeCommand({
        ClientId: clientId,
        Username: input.email,
      })
    );

    return {
      statusCode: StatusCodes.OK,
      body: {
        message: "Verification code resent. Please check your email.",
      },
    };
  } catch (error) {
    const cognitoError = error as CognitoError;

    if (cognitoError.name === "InvalidParameterException") {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        body: {
          error: "UserAlreadyConfirmed",
          message: "This account is already confirmed.",
        },
      };
    }

    if (cognitoError.name === "UserNotFoundException") {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        body: {
          error: "UserNotFound",
          message: "No account found with this email address.",
        },
      };
    }

    if (cognitoError.name === "TooManyRequestsException") {
      return {
        statusCode: StatusCodes.TOO_MANY_REQUESTS,
        body: {
          error: "TooManyRequests",
          message: "Too many attempts. Please try again later.",
        },
      };
    }

    throw error;
  }
}).use(jsonBodyParser);
