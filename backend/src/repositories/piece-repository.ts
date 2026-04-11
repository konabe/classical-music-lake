import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import createError from "http-errors";

import { dynamo, scanAllItems, TABLE_PIECES } from "../utils/dynamodb";
import type { Piece } from "../types";

export const findById = async (id: string): Promise<Piece | undefined> => {
  const result = await dynamo.send(new GetCommand({ TableName: TABLE_PIECES, Key: { id } }));
  return result.Item as Piece | undefined;
};

export const findAll = async (): Promise<Piece[]> => {
  return scanAllItems<Piece>(TABLE_PIECES);
};

export const save = async (item: Piece): Promise<void> => {
  await dynamo.send(new PutCommand({ TableName: TABLE_PIECES, Item: item }));
};

export const saveWithOptimisticLock = async (item: Piece, prevUpdatedAt: string): Promise<void> => {
  try {
    await dynamo.send(
      new PutCommand({
        TableName: TABLE_PIECES,
        Item: item,
        ConditionExpression: "updatedAt = :prevUpdatedAt",
        ExpressionAttributeValues: { ":prevUpdatedAt": prevUpdatedAt },
      })
    );
  } catch (err) {
    if (err instanceof ConditionalCheckFailedException) {
      throw new createError.Conflict("Piece was updated by another request");
    }
    throw err;
  }
};

export const remove = async (id: string): Promise<void> => {
  await dynamo.send(new DeleteCommand({ TableName: TABLE_PIECES, Key: { id } }));
};
