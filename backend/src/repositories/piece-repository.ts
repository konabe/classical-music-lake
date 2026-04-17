import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import createError from "http-errors";

// `scanAllItems` は `findAll`（deprecated・互換用）のみで使用する。`usePiecesAll` 廃止後に一括削除する。
import { dynamo, scanAllItems, scanPage, TABLE_PIECES } from "../utils/dynamodb"; // NOSONAR: typescript:S1874
import type { Piece } from "../types";
import type { PieceRepository } from "../domain/piece";

export class DynamoDBPieceRepository implements PieceRepository {
  async findById(id: string): Promise<Piece | undefined> {
    const result = await dynamo.send(new GetCommand({ TableName: TABLE_PIECES, Key: { id } }));
    return result.Item as Piece | undefined;
  }

  /**
   * @deprecated {@link findPage} を使うこと。`usePiecesAll` 廃止後に削除予定。
   */
  async findAll(): Promise<Piece[]> {
    return scanAllItems<Piece>(TABLE_PIECES); // NOSONAR: typescript:S1874 — 互換維持のため deprecated API を意図的に使用
  }

  async findPage(options: {
    limit: number;
    exclusiveStartKey?: Record<string, unknown>;
  }): Promise<{ items: Piece[]; lastEvaluatedKey?: Record<string, unknown> }> {
    return scanPage<Piece>(TABLE_PIECES, options);
  }

  async save(item: Piece): Promise<void> {
    await dynamo.send(new PutCommand({ TableName: TABLE_PIECES, Item: item }));
  }

  async saveWithOptimisticLock(item: Piece, prevUpdatedAt: string): Promise<void> {
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
  }

  async remove(id: string): Promise<void> {
    await dynamo.send(new DeleteCommand({ TableName: TABLE_PIECES, Key: { id } }));
  }
}
