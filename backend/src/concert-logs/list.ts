import { StatusCodes } from "http-status-codes";
import { queryItemsByUserId, TABLE_CONCERT_LOGS } from "../utils/dynamodb";
import { createHandler } from "../utils/middleware";
import { getUserId } from "../utils/auth";
import type { ConcertLog } from "../types";

export const handler = createHandler(async (event) => {
  const userId = getUserId(event);
  const logs = await queryItemsByUserId<ConcertLog>(TABLE_CONCERT_LOGS, userId);
  logs.sort((a, b) => b.concertDate.localeCompare(a.concertDate));
  return { statusCode: StatusCodes.OK, body: logs };
});
