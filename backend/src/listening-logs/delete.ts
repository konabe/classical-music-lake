import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import createError from "http-errors";
import { dynamo, TABLE_LISTENING_LOGS } from "../utils/dynamodb";
import { createHandler } from "../utils/middleware";

export const handler = createHandler(async (event) => {
  const id = event.pathParameters?.id;
  if (!id) throw createError(400, "id is required");

  await dynamo.send(new DeleteCommand({ TableName: TABLE_LISTENING_LOGS, Key: { id } }));
  return { statusCode: 204, body: "" };
});
