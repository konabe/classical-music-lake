import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import createError from "http-errors";
import { dynamo, TABLE_LISTENING_LOGS } from "../utils/dynamodb";
import { createHandler } from "../utils/middleware";
import type { CreateListeningLogInput, ListeningLog } from "../types";
import { isValidRating } from "../types";

export const handler = createHandler(async (event) => {
  if (!event.body) throw createError(400, "Request body is required");

  let input: CreateListeningLogInput;
  try {
    const parsed: unknown = JSON.parse(event.body);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw createError(400, "Request body must be a JSON object");
    }
    input = parsed as CreateListeningLogInput;
  } catch (err) {
    if ((err as { status?: number }).status === 400) throw err;
    throw createError(400, "Invalid JSON");
  }

  if (!isValidRating(input.rating)) throw createError(400, "rating must be between 1 and 5");

  const now = new Date().toISOString();
  const item: ListeningLog = {
    ...input,
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  await dynamo.send(new PutCommand({ TableName: TABLE_LISTENING_LOGS, Item: item }));
  return { statusCode: 201, body: item };
});
