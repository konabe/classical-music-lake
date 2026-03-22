import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { StatusCodes } from "http-status-codes";

import { createHandler, jsonBodyParser } from "../utils/middleware";
import { parseRequestBody } from "../utils/parsing";
import { verifyEmailSchema } from "../utils/schemas";
import type { CognitoError } from "../types";

const cognito = new CognitoIdentityProviderClient({});
const clientId = process.env.COGNITO_CLIENT_ID || "";

export const handler = createHandler(async (event) => {
  const input = parseRequestBody(event.body as unknown, verifyEmailSchema);

  try {
    await cognito.send(
      new ConfirmSignUpCommand({
        ClientId: clientId,
        Username: input.email,
        ConfirmationCode: input.code,
      })
    );

    return {
      statusCode: StatusCodes.OK,
      body: {
        message: "Email confirmed successfully.",
      },
    };
  } catch (error) {
    const cognitoError = error as CognitoError;

    if (cognitoError.name === "CodeMismatchException") {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        body: {
          error: "CodeMismatch",
          message: "The confirmation code is incorrect. Please try again.",
        },
      };
    }

    if (cognitoError.name === "ExpiredCodeException") {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        body: {
          error: "ExpiredCode",
          message: "The confirmation code has expired. Please request a new one.",
        },
      };
    }

    if (cognitoError.name === "NotAuthorizedException") {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        body: {
          error: "NotAuthorized",
          message: "This account cannot be confirmed. It may already be confirmed.",
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
