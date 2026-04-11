import { StatusCodes } from "http-status-codes";
import { createHandler } from "../../utils/middleware";
import { getIdParam } from "../../utils/path-params";
import { getPiece } from "../../usecases/piece/get-piece";

export const handler = createHandler(async (event) => {
  const id = getIdParam(event);
  const piece = await getPiece(id);
  return { statusCode: StatusCodes.OK, body: piece };
});
