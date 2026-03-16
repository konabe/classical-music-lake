import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { StatusCodes } from "http-status-codes";
import { dynamo, TABLE_PIECES } from "../utils/dynamodb";
import { createHandler, jsonBodyParser } from "../utils/middleware";
import { parseBody } from "../utils/parseBody";
import type { Piece } from "../types";
import { createPieceSchema } from "./schemas";

export const handler = createHandler(async (event) => {
  const input = parseBody(event.body as unknown, createPieceSchema);

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
