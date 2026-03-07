import { GetCommand } from "@aws-sdk/lib-dynamodb";
import createError from "http-errors";
import { dynamo, TABLE_LISTENING_LOGS } from "../utils/dynamodb";
import { createHandler } from "../utils/middleware";
import type { ListeningLog } from "../types";

export const handler = createHandler(async (event) => {
  const id = event.pathParameters?.id;
  if (!id) throw new createError.BadRequest("id is required");

  const result = await dynamo.send(
    new GetCommand({ TableName: TABLE_LISTENING_LOGS, Key: { id } })
  );
  if (!result.Item) throw new createError.NotFound("Listening log not found");
  return { statusCode: 200, body: result.Item as ListeningLog };
});
