import { StatusCodes } from "http-status-codes";
import { scanAllItems, TABLE_PIECES } from "../utils/dynamodb";
import { createHandler } from "../utils/middleware";
import type { Piece } from "../types";

export const handler = createHandler(async () => {
  const pieces = await scanAllItems<Piece>(TABLE_PIECES);
  pieces.sort((a, b) => a.title.localeCompare(b.title, "ja"));
  return { statusCode: StatusCodes.OK, body: pieces };
});
