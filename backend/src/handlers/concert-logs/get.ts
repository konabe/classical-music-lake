import { createHandler } from "@/utils/middleware";
import { getIdParam } from "@/utils/path-params";
import { getUserId } from "@/utils/auth";
import { ok } from "@/utils/response";
import { ConcertLogId, createConcertLogUsecase } from "@/usecases/concert-log-usecase";

const usecase = createConcertLogUsecase();

export const handler = createHandler(async (event) => {
  const id = getIdParam(event, ConcertLogId.from);
  const userId = getUserId(event);
  const log = await usecase.get(id, userId);
  return ok(log);
});
