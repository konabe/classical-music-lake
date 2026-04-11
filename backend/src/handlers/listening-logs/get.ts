import { createHandler } from "../../utils/middleware";
import { getIdParam } from "../../utils/path-params";
import { getUserId } from "../../utils/auth";
import { ok } from "../../utils/response";
import { getListeningLog } from "../../usecases/listening-log/get-listening-log";

export const handler = createHandler(async (event) => {
  const id = getIdParam(event);
  const userId = getUserId(event);
  const log = await getListeningLog(id, userId);
  return ok(log);
});
