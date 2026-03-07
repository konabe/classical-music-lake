import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import createError from "http-errors";
import { dynamo, TABLE_LISTENING_LOGS } from "../utils/dynamodb";
import { createHandler } from "../utils/middleware";
import type { ListeningLog, UpdateListeningLogInput } from "../types";
import { isValidRating } from "../types";

export const handler = createHandler(async (event) => {
  const id = event.pathParameters?.id;
  if (!id) throw createError(400, "id is required");
  if (!event.body) throw createError(400, "Request body is required");

  let input: UpdateListeningLogInput;
  try {
    input = JSON.parse(event.body);
  } catch {
    throw createError(400, "Invalid JSON");
  }

  if (input.rating !== undefined && !isValidRating(input.rating)) {
    throw createError(400, "rating must be between 1 and 5");
  }

  const existing = await dynamo.send(
    new GetCommand({ TableName: TABLE_LISTENING_LOGS, Key: { id } })
  );
  if (!existing.Item) throw createError(404, "Listening log not found");

  const current = existing.Item as ListeningLog;
  const updated: ListeningLog = {
    ...current,
    ...input,
    id,
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
  };
  await dynamo.send(new PutCommand({ TableName: TABLE_LISTENING_LOGS, Item: updated }));
  return { statusCode: 200, body: updated };
});
