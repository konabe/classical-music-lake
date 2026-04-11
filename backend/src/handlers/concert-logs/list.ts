import { createHandler } from "../../utils/middleware";
import { getUserId } from "../../utils/auth";
import { ok } from "../../utils/response";
import { listConcertLogs } from "../../usecases/concert-log/list-concert-logs";

export const handler = createHandler(async (event) => {
  const userId = getUserId(event);
  const logs = await listConcertLogs(userId);
  return ok(logs);
});
