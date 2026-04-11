import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "node:crypto";
import { StatusCodes } from "http-status-codes";
import { dynamo, TABLE_PIECES } from "../utils/dynamodb";
import { createHandler, jsonBodyParser } from "../utils/middleware";
import { parseRequestBody } from "../utils/parsing";
import { createPieceSchema } from "../utils/schemas";
import type { Piece } from "../types";

export const handler = createHandler(async (event) => {
  const input = parseRequestBody(event.body as unknown, createPieceSchema);

  const now = new Date().toISOString();
  const item: Piece = {
    ...input,
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  await dynamo.send(new PutCommand({ TableName: TABLE_PIECES, Item: item }));
  return { statusCode: StatusCodes.CREATED, body: item };
}).use(jsonBodyParser);
