import { GetCommand } from "@aws-sdk/lib-dynamodb";
import createError, { isHttpError } from "http-errors";
import { StatusCodes } from "http-status-codes";
import { dynamo, TABLE_PIECES } from "../utils/dynamodb";
import { createHandler } from "../utils/middleware";
import type { Piece } from "../types";

export const handler = createHandler(async (event) => {
  const id = event.pathParameters?.id;
  if (!id) throw new createError.BadRequest("id is required");

  try {
    const result = await dynamo.send(new GetCommand({ TableName: TABLE_PIECES, Key: { id } }));
    if (!result.Item) throw new createError.NotFound("Piece not found");
    return { statusCode: StatusCodes.OK, body: result.Item as Piece };
  } catch (err) {
    if (isHttpError(err)) throw err;
    throw new createError.InternalServerError("Failed to get piece");
  }
});
