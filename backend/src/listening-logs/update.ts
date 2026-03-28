import { GetCommand } from "@aws-sdk/lib-dynamodb";
import createError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { dynamo, updateItem, TABLE_LISTENING_LOGS } from "../utils/dynamodb";
import { createHandler, jsonBodyParser } from "../utils/middleware";
import { parseRequestBody } from "../utils/parsing";
import { updateListeningLogSchema } from "../utils/schemas";
import { getIdParam } from "../utils/path-params";
import { getUserId } from "../utils/auth";
import type { ListeningLog } from "../types";

export const handler = createHandler(async (event) => {
  const id = getIdParam(event);
  const input = parseRequestBody(event.body as unknown, updateListeningLogSchema);
  const userId = getUserId(event);

  const existing = await dynamo.send(
    new GetCommand({ TableName: TABLE_LISTENING_LOGS, Key: { id } })
  );
  const existingItem = existing.Item as ListeningLog | undefined;
  if (existingItem === undefined || existingItem.userId !== userId) {
    throw new createError.NotFound("Listening log not found");
  }

  const updated = await updateItem<ListeningLog>(TABLE_LISTENING_LOGS, id, input);
  return { statusCode: StatusCodes.OK, body: updated };
}).use(jsonBodyParser);
