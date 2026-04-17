import { createHandler } from "../../utils/middleware";
import { getIdParam } from "../../utils/path-params";
import { getUserId } from "../../utils/auth";
import { noContent } from "../../utils/response";
import { createConcertLogUsecase } from "../../usecases/concert-log-usecase";

const usecase = createConcertLogUsecase();

export const handler = createHandler(async (event) => {
  const id = getIdParam(event);
  const userId = getUserId(event);
  await usecase.delete(id, userId);
  return noContent();
});
