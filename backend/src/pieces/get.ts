import { GetCommand } from "@aws-sdk/lib-dynamodb";
import createError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { dynamo, TABLE_PIECES } from "../utils/dynamodb";
import { createHandler } from "../utils/middleware";
import { getIdParam } from "../utils/path-params";
import type { Piece } from "../types";

export const handler = createHandler(async (event) => {
  const id = getIdParam(event);
  const result = await dynamo.send(new GetCommand({ TableName: TABLE_PIECES, Key: { id } }));
  if (!result.Item) throw new createError.NotFound("Piece not found");
  return { statusCode: StatusCodes.OK, body: result.Item as Piece };
});
