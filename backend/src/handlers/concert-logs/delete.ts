import { StatusCodes } from "http-status-codes";

import { createHandler } from "../../utils/middleware";
import { getIdParam } from "../../utils/path-params";
import { getUserId } from "../../utils/auth";
import { deleteConcertLog } from "../../usecases/concert-log/delete-concert-log";

export const handler = createHandler(async (event) => {
  const id = getIdParam(event);
  const userId = getUserId(event);
  await deleteConcertLog(id, userId);
  return { statusCode: StatusCodes.NO_CONTENT, body: "" };
});
