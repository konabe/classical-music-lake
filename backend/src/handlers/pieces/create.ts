import { createHandler, jsonBodyParser } from "../../utils/middleware";
import { parseRequestBody } from "../../utils/parsing";
import { createPieceSchema } from "../../utils/schemas";
import { created } from "../../utils/response";
import { createPieceUsecase } from "../../usecases/piece-usecase";

const usecase = createPieceUsecase();

export const handler = createHandler(async (event) => {
  const input = parseRequestBody(event.body as unknown, createPieceSchema);
  const piece = await usecase.create(input);
  return created(piece);
}).use(jsonBodyParser);
