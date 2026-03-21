import { StatusCodes } from "http-status-codes";
import { queryItemsByUserId, TABLE_LISTENING_LOGS } from "../utils/dynamodb";
import { createHandler } from "../utils/middleware";
import { getUserId } from "../utils/auth";
import type { ListeningLog } from "../types";

export const handler = createHandler(async (event) => {
  const userId = getUserId(event);
  const logs = await queryItemsByUserId<ListeningLog>(TABLE_LISTENING_LOGS, userId);
  logs.sort((a, b) => b.listenedAt.localeCompare(a.listenedAt));
  return { statusCode: StatusCodes.OK, body: logs };
});
