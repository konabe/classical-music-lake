import { GetCommand } from "@aws-sdk/lib-dynamodb";
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
  if (item === undefined || item.userId !== userId) {
    throw new createError.NotFound("Concert log not found");
  }
  return { statusCode: StatusCodes.OK, body: item };
});
