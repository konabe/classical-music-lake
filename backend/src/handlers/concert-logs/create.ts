import { StatusCodes } from "http-status-codes";

import { createHandler, jsonBodyParser } from "../../utils/middleware";
import { parseRequestBody } from "../../utils/parsing";
import { createConcertLogSchema } from "../../utils/schemas";
import { getUserId } from "../../utils/auth";
import { createConcertLog } from "../../usecases/concert-log/create-concert-log";

export const handler = createHandler(async (event) => {
  const input = parseRequestBody(event.body as unknown, createConcertLogSchema);
  const userId = getUserId(event);
  const log = await createConcertLog(input, userId);
  return { statusCode: StatusCodes.CREATED, body: log };
}).use(jsonBodyParser);
