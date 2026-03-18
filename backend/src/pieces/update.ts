import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import createError from "http-errors";
import { StatusCodes } from "http-status-codes";
import { dynamo, TABLE_PIECES } from "../utils/dynamodb";
import { createHandler, jsonBodyParser } from "../utils/middleware";
import { parseRequestBody } from "../utils/parsing";
import { updatePieceSchema } from "../utils/schemas";
import { getIdParam } from "../utils/path-params";
import type { Piece } from "../types";

export const handler = createHandler(async (event) => {
  const id = getIdParam(event);
  const input = parseRequestBody(event.body as unknown, updatePieceSchema);

  const existing = await dynamo.send(new GetCommand({ TableName: TABLE_PIECES, Key: { id } }));
  if (!existing.Item) throw new createError.NotFound("Piece not found");

  const current = existing.Item as Piece;
  const updated: Piece = {
    ...current,
    ...input,
    id,
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
  };

  try {
    await dynamo.send(
      new PutCommand({
        TableName: TABLE_PIECES,
        Item: updated,
        ConditionExpression: "updatedAt = :prevUpdatedAt",
        ExpressionAttributeValues: { ":prevUpdatedAt": current.updatedAt },
      })
    );
  } catch (err) {
    if (err instanceof ConditionalCheckFailedException) {
      throw new createError.Conflict("Piece was updated by another request");
    }
    throw err;
  }

  return { statusCode: StatusCodes.OK, body: updated };
}).use(jsonBodyParser);
