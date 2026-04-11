import { StatusCodes } from "http-status-codes";

import { createHandler } from "../../utils/middleware";
import { getIdParam } from "../../utils/path-params";
import { getUserId } from "../../utils/auth";
import { createListeningLogUsecase } from "../../usecases/listening-log-usecase";

const usecase = createListeningLogUsecase();

export const handler = createHandler(async (event) => {
  const id = getIdParam(event);
  const userId = getUserId(event);
  await usecase.delete(id, userId);
  return { statusCode: StatusCodes.NO_CONTENT, body: "" };
});
