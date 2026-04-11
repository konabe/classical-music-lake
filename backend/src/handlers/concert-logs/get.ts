import { createHandler } from "../../utils/middleware";
import { getIdParam } from "../../utils/path-params";
import { getUserId } from "../../utils/auth";
import { ok } from "../../utils/response";
import { getConcertLog } from "../../usecases/concert-log/get-concert-log";

export const handler = createHandler(async (event) => {
  const id = getIdParam(event);
  const userId = getUserId(event);
  const log = await getConcertLog(id, userId);
  return ok(log);
});
