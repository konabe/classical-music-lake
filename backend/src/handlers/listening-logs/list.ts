import { StatusCodes } from "http-status-codes";

import { createHandler } from "../../utils/middleware";
import { getUserId } from "../../utils/auth";
import { listListeningLogs } from "../../usecases/listening-log/list-listening-logs";

export const handler = createHandler(async (event) => {
  const userId = getUserId(event);
  const logs = await listListeningLogs(userId);
  return { statusCode: StatusCodes.OK, body: logs };
});
