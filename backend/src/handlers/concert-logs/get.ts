import { StatusCodes } from "http-status-codes";

import { createHandler } from "../../utils/middleware";
import { getIdParam } from "../../utils/path-params";
import { getUserId } from "../../utils/auth";
import { getConcertLog } from "../../usecases/concert-log/get-concert-log";

export const handler = createHandler(async (event) => {
  const id = getIdParam(event);
  const userId = getUserId(event);
  const log = await getConcertLog(id, userId);
  return { statusCode: StatusCodes.OK, body: log };
});
