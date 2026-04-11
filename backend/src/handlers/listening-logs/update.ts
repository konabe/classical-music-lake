import { createHandler, jsonBodyParser } from "../../utils/middleware";
import { parseRequestBody } from "../../utils/parsing";
import { updateListeningLogSchema } from "../../utils/schemas";
import { getIdParam } from "../../utils/path-params";
import { getUserId } from "../../utils/auth";
import { ok } from "../../utils/response";
import { updateListeningLog } from "../../usecases/listening-log/update-listening-log";
import type { ListeningLog } from "../../types";

export const handler = createHandler(async (event) => {
  const id = getIdParam(event);
  const input = parseRequestBody(event.body as unknown, updateListeningLogSchema);
  const userId = getUserId(event);
  const updated = await updateListeningLog(id, input as Partial<ListeningLog>, userId);
  return ok(updated);
}).use(jsonBodyParser);
