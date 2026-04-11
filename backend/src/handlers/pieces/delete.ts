import { StatusCodes } from "http-status-codes";
import { createHandler } from "../../utils/middleware";
import { getIdParam } from "../../utils/path-params";
import { deletePiece } from "../../usecases/piece/delete-piece";

export const handler = createHandler(async (event) => {
  const id = getIdParam(event);
  await deletePiece(id);
  return { statusCode: StatusCodes.NO_CONTENT, body: "" };
});
