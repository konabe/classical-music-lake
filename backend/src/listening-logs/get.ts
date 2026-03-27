import { StatusCodes } from "http-status-codes";
import { getItemByIdAndUserId, TABLE_LISTENING_LOGS } from "../utils/dynamodb";
import { createHandler } from "../utils/middleware";
import { getIdParam } from "../utils/path-params";
import { getUserId } from "../utils/auth";
import type { ListeningLog } from "../types";

export const handler = createHandler(async (event) => {
  const id = getIdParam(event);
  const userId = getUserId(event);
  const item = await getItemByIdAndUserId<ListeningLog>(TABLE_LISTENING_LOGS, id, userId);
  return { statusCode: StatusCodes.OK, body: item };
});
