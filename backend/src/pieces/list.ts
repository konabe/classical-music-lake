import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { StatusCodes } from "http-status-codes";
import { dynamo, TABLE_PIECES } from "../utils/dynamodb";
import { createHandler } from "../utils/middleware";
import type { Piece } from "../types";

export const handler = createHandler(async () => {
  const result = await dynamo.send(new ScanCommand({ TableName: TABLE_PIECES }));
  const pieces = (result.Items ?? []) as Piece[];
  pieces.sort((a, b) => a.title.localeCompare(b.title, "ja"));
  return { statusCode: StatusCodes.OK, body: pieces };
});
