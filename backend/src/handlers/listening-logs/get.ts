import { createHandler } from "../../utils/middleware";
import { getIdParam } from "../../utils/path-params";
import { getUserId } from "../../utils/auth";
import { ok } from "../../utils/response";
import { createListeningLogUsecase, ListeningLogId } from "../../usecases/listening-log-usecase";

const usecase = createListeningLogUsecase();

export const handler = createHandler(async (event) => {
  const id = getIdParam(event, ListeningLogId.from);
  const userId = getUserId(event);
  const log = await usecase.get(id, userId);
  return ok(log);
});
