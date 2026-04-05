import { GetCommand } from "@aws-sdk/lib-dynamodb";
import createError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { dynamo, updateItem, TABLE_CONCERT_LOGS } from "../utils/dynamodb";
import { createHandler, jsonBodyParser } from "../utils/middleware";
import { parseRequestBody } from "../utils/parsing";
import { updateConcertLogSchema } from "../utils/schemas";
import { getIdParam } from "../utils/path-params";
import { getUserId } from "../utils/auth";
import type { ConcertLog } from "../types";

export const handler = createHandler(async (event) => {
  const id = getIdParam(event);
  const input = parseRequestBody(event.body as unknown, updateConcertLogSchema);
  const userId = getUserId(event);

  const existing = await dynamo.send(
    new GetCommand({ TableName: TABLE_CONCERT_LOGS, Key: { id } })
  );
  const existingItem = existing.Item as ConcertLog | undefined;
  if (existingItem === undefined || existingItem.userId !== userId) {
    throw new createError.NotFound("Concert log not found");
  }

  const updated = await updateItem<ConcertLog>(TABLE_CONCERT_LOGS, id, input);
  return { statusCode: StatusCodes.OK, body: updated };
}).use(jsonBodyParser);
