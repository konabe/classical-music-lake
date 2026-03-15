import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import createError, { isHttpError } from "http-errors";
import { StatusCodes } from "http-status-codes";
import { dynamo, TABLE_PIECES } from "../utils/dynamodb";
import { createHandler, jsonBodyParser } from "../utils/middleware";
import { parseRequestBody } from "../utils/parsing";
import type { Piece, UpdatePieceInput } from "../types";

export const handler = createHandler(async (event) => {
  const id = event.pathParameters?.id;
  if (!id) throw new createError.BadRequest("id is required");
  const input = parseRequestBody<UpdatePieceInput>(event.body as unknown);

  if (input.title !== undefined && !input.title) {
    throw new createError.BadRequest("title must be a non-empty string");
  }
  if (input.composer !== undefined && !input.composer) {
    throw new createError.BadRequest("composer must be a non-empty string");
  }

  try {
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
    await dynamo.send(
      new PutCommand({
        TableName: TABLE_PIECES,
        Item: updated,
        ConditionExpression: "updatedAt = :prevUpdatedAt",
        ExpressionAttributeValues: { ":prevUpdatedAt": current.updatedAt },
      })
    );
    return { statusCode: StatusCodes.OK, body: updated };
  } catch (err) {
    if (isHttpError(err)) throw err;
    if (err instanceof ConditionalCheckFailedException) {
      throw new createError.Conflict("Piece was updated by another request");
    }
    throw new createError.InternalServerError("Failed to update piece");
  }
}).use(jsonBodyParser);
