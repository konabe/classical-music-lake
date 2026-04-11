import { createHandler } from "../../utils/middleware";
import { getUserId } from "../../utils/auth";
import { ok } from "../../utils/response";
import { createConcertLogUsecase } from "../../usecases/concert-log-usecase";

const usecase = createConcertLogUsecase();

export const handler = createHandler(async (event) => {
  const userId = getUserId(event);
  const logs = await usecase.list(userId);
  return ok(logs);
});
