import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo, TABLE_LISTENING_LOGS } from "../utils/dynamodb";
import { ok, notFound, badRequest, internalError } from "../utils/response";
import { createHandler } from "../utils/middleware";
import type { ListeningLog, UpdateListeningLogInput } from "../types";
import { isValidRating } from "../types";

export const handler = createHandler(async (event) => {
  const id = event.pathParameters?.id;
  if (!id) return badRequest("id is required");
  if (!event.body) return badRequest("Request body is required");

  let input: UpdateListeningLogInput;
  try {
    input = JSON.parse(event.body);
  } catch {
    return badRequest("Invalid JSON");
  }

  if (input.rating !== undefined && !isValidRating(input.rating)) {
    return badRequest("rating must be between 1 and 5");
  }

  try {
    const existing = await dynamo.send(
      new GetCommand({ TableName: TABLE_LISTENING_LOGS, Key: { id } })
    );
    if (!existing.Item) return notFound("Listening log not found");

    const current = existing.Item as ListeningLog;
    const updated: ListeningLog = {
      ...current,
      ...input,
      id,
      createdAt: current.createdAt,
      updatedAt: new Date().toISOString(),
    };
    await dynamo.send(new PutCommand({ TableName: TABLE_LISTENING_LOGS, Item: updated }));
    return ok(updated);
  } catch (err) {
    return internalError(err);
  }
});
