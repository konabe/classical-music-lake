import { createHandler, jsonBodyParser } from "../../utils/middleware";
import { parseRequestBody } from "../../utils/parsing";
import { createListeningLogSchema } from "../../utils/schemas";
import { getUserId } from "../../utils/auth";
import { created } from "../../utils/response";
import { createListeningLogUsecase } from "../../usecases/listening-log-usecase";
import type { Rating } from "../../types";

const usecase = createListeningLogUsecase();

export const handler = createHandler(async (event) => {
  const input = parseRequestBody(event.body as unknown, createListeningLogSchema);
  const userId = getUserId(event);
  const log = await usecase.create({ ...input, rating: input.rating as Rating, userId });
  return created(log);
}).use(jsonBodyParser);
