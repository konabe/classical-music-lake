import { DeleteCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import createError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { dynamo, TABLE_CONCERT_LOGS } from "../utils/dynamodb";
import { createHandler } from "../utils/middleware";
import { getIdParam } from "../utils/path-params";
import { getUserId } from "../utils/auth";
import type { ConcertLog } from "../types";

export const handler = createHandler(async (event) => {
  const id = getIdParam(event);
  const userId = getUserId(event);

  const result = await dynamo.send(new GetCommand({ TableName: TABLE_CONCERT_LOGS, Key: { id } }));
  const item = result.Item as ConcertLog | undefined;
  if (item?.userId !== userId) {
    throw new createError.NotFound("Concert log not found");
  }

  await dynamo.send(new DeleteCommand({ TableName: TABLE_CONCERT_LOGS, Key: { id } }));
  return { statusCode: StatusCodes.NO_CONTENT, body: "" };
});
