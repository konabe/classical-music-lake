import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { StatusCodes } from "http-status-codes";
import { dynamo, TABLE_LISTENING_LOGS } from "../utils/dynamodb";
import { createHandler } from "../utils/middleware";
import { getIdParam } from "../utils/path-params";

export const handler = createHandler(async (event) => {
  const id = getIdParam(event);

  await dynamo.send(new DeleteCommand({ TableName: TABLE_LISTENING_LOGS, Key: { id } }));
  return { statusCode: StatusCodes.NO_CONTENT, body: "" };
});
