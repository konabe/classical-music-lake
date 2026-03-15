import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import createError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { dynamo, TABLE_LISTENING_LOGS } from "../utils/dynamodb";
import { createHandler, jsonBodyParser } from "../utils/middleware";
import { parseRequestBody } from "../utils/parsing";
import { getIdParam } from "../utils/path-params";
import type { ListeningLog, UpdateListeningLogInput } from "../types";
import { isValidRating } from "../types";

export const handler = createHandler(async (event) => {
  const id = getIdParam(event);
  const input = parseRequestBody<UpdateListeningLogInput>(event.body as unknown);

  if (input.rating !== undefined && !isValidRating(input.rating)) {
    throw new createError.BadRequest("rating must be between 1 and 5");
  }

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
}).use(jsonBodyParser);
