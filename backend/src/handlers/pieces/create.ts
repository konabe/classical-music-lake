import { createAdminHandler, jsonBodyParser } from "@/utils/middleware";
import { parseRequestBody } from "@/utils/parsing";
import { createPieceSchema } from "@/utils/schemas";
import { created } from "@/utils/response";
import { createPieceUsecase } from "@/usecases/piece-usecase";

const usecase = createPieceUsecase();

export const handler = createAdminHandler(async (event) => {
  const input = parseRequestBody(event.body, createPieceSchema);
  const piece = await usecase.create(input);
  return created(piece);
}).use(jsonBodyParser);
