import { createHandler, jsonBodyParser } from "../../utils/middleware";
import { parseRequestBody } from "../../utils/parsing";
import { createListeningLogSchema } from "../../utils/schemas";
import { getUserId } from "../../utils/auth";
import { created } from "../../utils/response";
import { createListeningLog } from "../../usecases/listening-log/create-listening-log";
import type { Rating } from "../../types";

export const handler = createHandler(async (event) => {
  const input = parseRequestBody(event.body as unknown, createListeningLogSchema);
  const userId = getUserId(event);
  const log = await createListeningLog({ ...input, rating: input.rating as Rating, userId });
  return created(log);
}).use(jsonBodyParser);
