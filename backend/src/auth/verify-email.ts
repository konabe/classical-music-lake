import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import { createHandler, jsonBodyParser } from "../utils/middleware";
import { parseRequestBody } from "../utils/parsing";
import { verifyEmailSchema } from "../utils/schemas";
import { ok, badRequest, tooManyRequests, internalError } from "../utils/response";
import { env } from "../utils/env";
import type { CognitoError } from "../types";

const cognito = new CognitoIdentityProviderClient({});

export const handler = createHandler(async (event) => {
  const input = parseRequestBody(event.body as unknown, verifyEmailSchema);

  try {
    await cognito.send(
      new ConfirmSignUpCommand({
        ClientId: env.cognitoClientId,
        Username: input.email,
        ConfirmationCode: input.code,
      })
    );

    return ok({ message: "Email confirmed successfully." });
  } catch (error) {
    const cognitoError = error as CognitoError;

    if (cognitoError.name === "CodeMismatchException") {
      return badRequest("CodeMismatch", "The confirmation code is incorrect. Please try again.");
    }

    if (cognitoError.name === "ExpiredCodeException") {
      return badRequest(
        "ExpiredCode",
        "The confirmation code has expired. Please request a new one."
      );
    }

    if (cognitoError.name === "NotAuthorizedException") {
      return badRequest(
        "NotAuthorized",
        "This account cannot be confirmed. It may already be confirmed."
      );
    }

    if (cognitoError.name === "TooManyRequestsException") {
      return tooManyRequests();
    }

    return internalError();
  }
}).use(jsonBodyParser);
