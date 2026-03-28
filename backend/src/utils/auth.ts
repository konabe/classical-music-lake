import createError from "http-errors";
import type { APIGatewayProxyEvent } from "aws-lambda";

type CognitoAuthorizerContext = {
  claims: {
    sub: string;
    [key: string]: string;
  };
};

export const getUserId = (event: APIGatewayProxyEvent): string => {
  const authorizer = event.requestContext.authorizer as unknown as CognitoAuthorizerContext | null;
  const userId = authorizer?.claims?.sub;
  if (userId === undefined || userId === "")
    throw new createError.Unauthorized("User not authenticated");
  return userId;
};
