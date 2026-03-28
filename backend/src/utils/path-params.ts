import createError from "http-errors";
import type { APIGatewayProxyEvent } from "aws-lambda";

export const getIdParam = (event: APIGatewayProxyEvent): string => {
  const id = event.pathParameters?.id;
  if (id === undefined || id === "") throw new createError.BadRequest("id is required");
  return id;
};
