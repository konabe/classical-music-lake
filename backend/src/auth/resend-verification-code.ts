import {
  CognitoIdentityProviderClient,
  ResendConfirmationCodeCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import { createHandler, jsonBodyParser } from "../utils/middleware";
import { parseRequestBody } from "../utils/parsing";
import { resendVerificationCodeSchema } from "../utils/schemas";
import { ok, badRequest, tooManyRequests, internalError } from "../utils/response";
import { env } from "../utils/env";
import type { CognitoError } from "../types";

const cognito = new CognitoIdentityProviderClient({});

export const handler = createHandler(async (event) => {
  const input = parseRequestBody(event.body as unknown, resendVerificationCodeSchema);

  try {
    await cognito.send(
      new ResendConfirmationCodeCommand({
        ClientId: env.cognitoClientId,
        Username: input.email,
      })
    );

    return ok({ message: "Verification code resent. Please check your email." });
  } catch (error) {
    const cognitoError = error as CognitoError;

    if (cognitoError.name === "InvalidParameterException") {
      return badRequest("UserAlreadyConfirmed", "This account is already confirmed.");
    }

    if (cognitoError.name === "UserNotFoundException") {
      return badRequest("UserNotFound", "No account found with this email address.");
    }

    if (cognitoError.name === "TooManyRequestsException") {
      return tooManyRequests();
    }

    return internalError();
  }
}).use(jsonBodyParser);
