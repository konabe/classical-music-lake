import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import createError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { dynamo, TABLE_PIECES } from "../utils/dynamodb";
import { createHandler } from "../utils/middleware";
import { parseRequestBody } from "../utils/parsing";
import type { CreatePieceInput, Piece } from "../types";

export const handler = createHandler(async (event) => {
  if (!event.body) throw new createError.BadRequest("Request body is required");

  const input = parseRequestBody<CreatePieceInput>(event.body);

  if (!input.title) throw new createError.BadRequest("title is required");
  if (!input.composer) throw new createError.BadRequest("composer is required");

  const now = new Date().toISOString();
  const item: Piece = {
    ...input,
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  await dynamo.send(new PutCommand({ TableName: TABLE_PIECES, Item: item }));
  return { statusCode: StatusCodes.CREATED, body: item };
});
