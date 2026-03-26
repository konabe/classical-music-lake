import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { StatusCodes } from "http-status-codes";
import { dynamo, getItemByOwner, TABLE_LISTENING_LOGS } from "../utils/dynamodb";
import { createHandler } from "../utils/middleware";
import { getIdParam } from "../utils/path-params";
import { getUserId } from "../utils/auth";
import type { ListeningLog } from "../types";

export const handler = createHandler(async (event) => {
  const id = getIdParam(event);
  const userId = getUserId(event);

  await getItemByOwner<ListeningLog>(TABLE_LISTENING_LOGS, id, userId);

  await dynamo.send(new DeleteCommand({ TableName: TABLE_LISTENING_LOGS, Key: { id } }));
  return { statusCode: StatusCodes.NO_CONTENT, body: "" };
});
