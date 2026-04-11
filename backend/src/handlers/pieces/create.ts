import { StatusCodes } from "http-status-codes";
import { createHandler, jsonBodyParser } from "../../utils/middleware";
import { parseRequestBody } from "../../utils/parsing";
import { createPieceSchema } from "../../utils/schemas";
import { createPiece } from "../../usecases/piece/create-piece";

export const handler = createHandler(async (event) => {
  const input = parseRequestBody(event.body as unknown, createPieceSchema);
  const piece = await createPiece(input);
  return { statusCode: StatusCodes.CREATED, body: piece };
}).use(jsonBodyParser);
