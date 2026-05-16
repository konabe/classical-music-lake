import { createHandler, jsonBodyParser } from "@/utils/middleware";
import { parseRequestBody } from "@/utils/parsing";
import { updateConcertLogSchema } from "@/utils/schemas";
import { getIdParam } from "@/utils/path-params";
import { getUserId } from "@/utils/auth";
import { ok } from "@/utils/response";
import { ConcertLogId, createConcertLogUsecase } from "@/usecases/concert-log-usecase";

const usecase = createConcertLogUsecase();

export const handler = createHandler(async (event) => {
  const id = getIdParam(event, ConcertLogId.from);
  const input = parseRequestBody(event.body as unknown, updateConcertLogSchema);
  const userId = getUserId(event);
  const updated = await usecase.update(id, input, userId);
  return ok(updated);
}).use(jsonBodyParser);
