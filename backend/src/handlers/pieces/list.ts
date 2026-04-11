import { StatusCodes } from "http-status-codes";
import { createHandler } from "../../utils/middleware";
import { listPieces } from "../../usecases/piece/list-pieces";

export const handler = createHandler(async () => {
  const pieces = await listPieces();
  return { statusCode: StatusCodes.OK, body: pieces };
});
