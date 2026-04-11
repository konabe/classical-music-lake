import { StatusCodes } from "http-status-codes";
import { createHandler, jsonBodyParser } from "../../utils/middleware";
import { parseRequestBody } from "../../utils/parsing";
import { updatePieceSchema } from "../../utils/schemas";
import { getIdParam } from "../../utils/path-params";
import { updatePiece } from "../../usecases/piece/update-piece";

export const handler = createHandler(async (event) => {
  const id = getIdParam(event);
  const input = parseRequestBody(event.body as unknown, updatePieceSchema);
  const piece = await updatePiece(id, input);
  return { statusCode: StatusCodes.OK, body: piece };
}).use(jsonBodyParser);
