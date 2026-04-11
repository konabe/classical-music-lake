import { StatusCodes } from "http-status-codes";
import { createHandler } from "../../utils/middleware";
import { getIdParam } from "../../utils/path-params";
import { createPieceUsecase } from "../../usecases/piece-usecase";

const usecase = createPieceUsecase();

export const handler = createHandler(async (event) => {
  const id = getIdParam(event);
  await usecase.delete(id);
  return { statusCode: StatusCodes.NO_CONTENT, body: "" };
});
