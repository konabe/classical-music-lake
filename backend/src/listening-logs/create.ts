import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "node:crypto";
import { StatusCodes } from "http-status-codes";
import { dynamo, TABLE_LISTENING_LOGS } from "../utils/dynamodb";
import { createHandler, jsonBodyParser } from "../utils/middleware";
import { parseRequestBody } from "../utils/parsing";
import { createListeningLogSchema } from "../utils/schemas";
import { getUserId } from "../utils/auth";
import type { ListeningLog, Rating } from "../types";

export const handler = createHandler(async (event) => {
  const input = parseRequestBody(event.body as unknown, createListeningLogSchema);
  const userId = getUserId(event);

  const now = new Date().toISOString();
  const item: ListeningLog = {
    ...input,
    rating: input.rating as Rating,
    id: randomUUID(),
    userId,
    createdAt: now,
    updatedAt: now,
  };
  await dynamo.send(new PutCommand({ TableName: TABLE_LISTENING_LOGS, Item: item }));
  return { statusCode: StatusCodes.CREATED, body: item };
}).use(jsonBodyParser);
