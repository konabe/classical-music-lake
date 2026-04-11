import { createHandler } from "../../utils/middleware";
import { getUserId } from "../../utils/auth";
import { ok } from "../../utils/response";
import { listListeningLogs } from "../../usecases/listening-log/list-listening-logs";

export const handler = createHandler(async (event) => {
  const userId = getUserId(event);
  const logs = await listListeningLogs(userId);
  return ok(logs);
});
