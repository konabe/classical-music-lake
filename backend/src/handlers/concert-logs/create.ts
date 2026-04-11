import { createHandler, jsonBodyParser } from "../../utils/middleware";
import { parseRequestBody } from "../../utils/parsing";
import { createConcertLogSchema } from "../../utils/schemas";
import { getUserId } from "../../utils/auth";
import { created } from "../../utils/response";
import { createConcertLog } from "../../usecases/concert-log/create-concert-log";

export const handler = createHandler(async (event) => {
  const input = parseRequestBody(event.body as unknown, createConcertLogSchema);
  const userId = getUserId(event);
  const log = await createConcertLog(input, userId);
  return created(log);
}).use(jsonBodyParser);
