import { StatusCodes } from "http-status-codes";
import { scanAllItems, TABLE_LISTENING_LOGS } from "../utils/dynamodb";
import { createHandler } from "../utils/middleware";
import type { ListeningLog } from "../types";

export const handler = createHandler(async () => {
  const logs = await scanAllItems<ListeningLog>(TABLE_LISTENING_LOGS);
  logs.sort((a, b) => b.listenedAt.localeCompare(a.listenedAt));
  return { statusCode: StatusCodes.OK, body: logs };
});
