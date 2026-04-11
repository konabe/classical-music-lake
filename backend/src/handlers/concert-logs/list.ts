import { StatusCodes } from "http-status-codes";

import { createHandler } from "../../utils/middleware";
import { getUserId } from "../../utils/auth";
import { listConcertLogs } from "../../usecases/concert-log/list-concert-logs";

export const handler = createHandler(async (event) => {
  const userId = getUserId(event);
  const logs = await listConcertLogs(userId);
  return { statusCode: StatusCodes.OK, body: logs };
});
