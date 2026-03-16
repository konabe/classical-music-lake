import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import createError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { dynamo, TABLE_LISTENING_LOGS } from "../utils/dynamodb";
import { createHandler } from "../utils/middleware";
import { parseBody } from "../utils/parseBody";
import type { ListeningLog } from "../types";
import { updateListeningLogSchema } from "./schemas";

export const handler = createHandler(async (event) => {
  const id = event.pathParameters?.id;
  if (!id) throw new createError.BadRequest("id is required");

  const input = parseBody(event.body, updateListeningLogSchema);

  const existing = await dynamo.send(
    new GetCommand({ TableName: TABLE_LISTENING_LOGS, Key: { id } })
  );
  if (!existing.Item) throw new createError.NotFound("Listening log not found");

  const current = existing.Item as ListeningLog;
  const updated: ListeningLog = {
    ...current,
    ...input,
    id,
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
  };
  await dynamo.send(new PutCommand({ TableName: TABLE_LISTENING_LOGS, Item: updated }));
  return { statusCode: StatusCodes.OK, body: updated };
});
