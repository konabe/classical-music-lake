import { StatusCodes } from "http-status-codes";
import { getItemByIdAndUserId, updateItem, TABLE_LISTENING_LOGS } from "../utils/dynamodb";
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
  await getItemByIdAndUserId<ListeningLog>(TABLE_LISTENING_LOGS, id, userId);
  const updated = await updateItem<ListeningLog>(TABLE_LISTENING_LOGS, id, input);
  return { statusCode: StatusCodes.OK, body: updated };
}).use(jsonBodyParser);
