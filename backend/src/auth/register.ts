import { CognitoIdentityServiceProvider } from "@aws-sdk/client-cognito-identity-provider";
import { StatusCodes } from "http-status-codes";

import { createHandler, jsonBodyParser } from "../utils/middleware";
import { parseRequestBody } from "../utils/parsing";
import { registerSchema } from "../utils/schemas";

const cognito = new CognitoIdentityServiceProvider();
const clientId = process.env.COGNITO_CLIENT_ID || "";

interface CognitoError extends Error {
  Code?: string;
}

export const handler = createHandler(async (event) => {
  const input = parseRequestBody(event.body as unknown, registerSchema);

  try {
    await cognito.signUp({
      ClientId: clientId,
      Username: input.email,
      Password: input.password,
      UserAttributes: [
        {
          Name: "email",
          Value: input.email,
        },
      ],
    });

    return {
      statusCode: StatusCodes.CREATED,
      body: {
        message: "User created successfully. Please check your email to verify your account.",
      },
    };
  } catch (error) {
    const cognitoError = error as CognitoError;

    if (cognitoError.Code === "UsernameExistsException") {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        body: {
          error: "UserExists",
          message: "An account with the given email already exists.",
        },
      };
    }

    if (cognitoError.Code === "InvalidPasswordException") {
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        body: {
          error: "InvalidPassword",
          message:
            "Password does not meet the requirements. Password must be at least 8 characters long and contain uppercase, lowercase, and numeric characters.",
        },
      };
    }

    if (cognitoError.Code === "TooManyRequestsException") {
      return {
        statusCode: StatusCodes.TOO_MANY_REQUESTS,
        body: {
          error: "TooManyRequests",
          message: "Too many registration attempts. Please try again later.",
        },
      };
    }

    throw error;
  }
}).use(jsonBodyParser);
