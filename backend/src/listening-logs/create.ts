import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import createError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { dynamo, TABLE_LISTENING_LOGS } from "../utils/dynamodb";
import { createHandler } from "../utils/middleware";
import { parseRequestBody } from "../utils/parsing";
import type { CreateListeningLogInput, ListeningLog } from "../types";
import { isValidRating } from "../types";

export const handler = createHandler(async (event) => {
  if (!event.body) throw new createError.BadRequest("Request body is required");

  const input = parseRequestBody<CreateListeningLogInput>(event.body);

  if (!isValidRating(input.rating))
    throw new createError.BadRequest("rating must be between 1 and 5");

  const now = new Date().toISOString();
  const item: ListeningLog = {
    ...input,
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  await dynamo.send(new PutCommand({ TableName: TABLE_LISTENING_LOGS, Item: item }));
  return { statusCode: StatusCodes.CREATED, body: item };
});
