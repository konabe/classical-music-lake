import { StatusCodes } from "http-status-codes";

import { createHandler } from "../../utils/middleware";
import { getIdParam } from "../../utils/path-params";
import { getUserId } from "../../utils/auth";
import { deleteListeningLog } from "../../usecases/listening-log/delete-listening-log";

export const handler = createHandler(async (event) => {
  const id = getIdParam(event);
  const userId = getUserId(event);
  await deleteListeningLog(id, userId);
  return { statusCode: StatusCodes.NO_CONTENT, body: "" };
});
