import createError from "http-errors";
import type { APIGatewayProxyEvent } from "aws-lambda";

type CognitoAuthorizerContext = {
  claims: {
    sub: string;
    [key: string]: unknown;
  };
};

export const ADMIN_GROUP_NAME = "admin";

const getAuthorizerContext = (event: APIGatewayProxyEvent): CognitoAuthorizerContext | null => {
  return event.requestContext.authorizer as unknown as CognitoAuthorizerContext | null;
};

export const getUserId = (event: APIGatewayProxyEvent): string => {
  const authorizer = getAuthorizerContext(event);
  const userId = authorizer?.claims?.sub;
  if (typeof userId !== "string" || userId === "") {
    throw new createError.Unauthorized("User not authenticated");
  }
  return userId;
};

// Cognito の cognito:groups クレームは所属グループによって配列・カンマ区切り文字列のいずれかで渡る
export const getUserGroups = (event: APIGatewayProxyEvent): string[] => {
  const raw = getAuthorizerContext(event)?.claims?.["cognito:groups"];
  if (Array.isArray(raw)) {
    return raw.filter((v): v is string => {
      return typeof v === "string";
    });
  }
  if (typeof raw === "string" && raw !== "") {
    return raw
      .split(",")
      .map((s) => {
        return s.trim();
      })
      .filter((s) => {
        return s !== "";
      });
  }
  return [];
};

export const isAdmin = (event: APIGatewayProxyEvent): boolean => {
  return getUserGroups(event).includes(ADMIN_GROUP_NAME);
};

export const requireAdmin = (event: APIGatewayProxyEvent): void => {
  if (!isAdmin(event)) {
    throw new createError.Forbidden("Admin privilege required");
  }
};
