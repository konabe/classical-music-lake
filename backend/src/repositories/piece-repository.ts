import { DeleteCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

import type { PieceId } from "../domain/value-objects/ids";
// `scanAllItems` は `findAll`（deprecated・互換用）のみで使用する。`usePiecesAll` 廃止後に一括削除する。
import {
  dynamo,
  putItemWithOptimisticLock,
  scanAllItems,
  scanPage,
  TABLE_PIECES,
} from "../utils/dynamodb"; // NOSONAR: typescript:S1874
import type { Piece } from "../types";
import type { PieceRepository } from "../domain/piece";

export class DynamoDBPieceRepository implements PieceRepository {
  async findById(id: PieceId): Promise<Piece | undefined> {
    const result = await dynamo.send(
      new GetCommand({ TableName: TABLE_PIECES, Key: { id: id.value } }),
    );
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
    await putItemWithOptimisticLock({
      tableName: TABLE_PIECES,
      item,
      prevUpdatedAt,
      conflictMessage: "Piece was updated by another request",
    });
  }

  async remove(id: PieceId): Promise<void> {
    await dynamo.send(new DeleteCommand({ TableName: TABLE_PIECES, Key: { id: id.value } }));
  }
}
