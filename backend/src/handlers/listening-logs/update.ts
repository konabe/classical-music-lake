import { createHandler, jsonBodyParser } from "../../utils/middleware";
import { parseRequestBody } from "../../utils/parsing";
import { updateListeningLogSchema } from "../../utils/schemas";
import { getIdParam } from "../../utils/path-params";
import { getUserId } from "../../utils/auth";
import { ok } from "../../utils/response";
import { createListeningLogUsecase, ListeningLogId } from "../../usecases/listening-log-usecase";
import type { ListeningLog } from "../../types";

const usecase = createListeningLogUsecase();

export const handler = createHandler(async (event) => {
  const id = getIdParam(event, ListeningLogId.from);
  const input = parseRequestBody(event.body as unknown, updateListeningLogSchema);
  const userId = getUserId(event);
  const updated = await usecase.update(id, input as Partial<ListeningLog>, userId);
  return ok(updated);
}).use(jsonBodyParser);
