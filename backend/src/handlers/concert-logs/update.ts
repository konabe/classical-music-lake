import { createHandler, jsonBodyParser } from "../../utils/middleware";
import { parseRequestBody } from "../../utils/parsing";
import { updateConcertLogSchema } from "../../utils/schemas";
import { getIdParam } from "../../utils/path-params";
import { getUserId } from "../../utils/auth";
import { ok } from "../../utils/response";
import { updateConcertLog } from "../../usecases/concert-log/update-concert-log";
import type { ConcertLog } from "../../types";

export const handler = createHandler(async (event) => {
  const id = getIdParam(event);
  const input = parseRequestBody(event.body as unknown, updateConcertLogSchema);
  const userId = getUserId(event);
  const updated = await updateConcertLog(id, input as Partial<ConcertLog>, userId);
  return ok(updated);
}).use(jsonBodyParser);
