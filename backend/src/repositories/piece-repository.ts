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

/**
 * 旧データ（`videoUrl: string`）を新スキーマ（`videoUrls: string[]`）へ正規化する。
 * 1 楽曲に複数動画を持てるようにフィールド名を変更したため、未マイグレーションのレコード
 * を読み込んだ時点で透過的に変換する（書き込みは常に新スキーマのみで行うので、上書きで自然に消える）。
 */
export function normalizeLegacyVideoUrl(item: Piece | undefined): Piece | undefined {
  if (item === undefined) {
    return undefined;
  }
  const legacy = item as Piece & { videoUrl?: string };
  if (legacy.videoUrl === undefined) {
    return item;
  }
  const { videoUrl, ...rest } = legacy;
  if (rest.videoUrls === undefined && typeof videoUrl === "string" && videoUrl !== "") {
    return { ...rest, videoUrls: [videoUrl] };
  }
  return rest;
}

export class DynamoDBPieceRepository implements PieceRepository {
  async findById(id: PieceId): Promise<Piece | undefined> {
    const result = await dynamo.send(
      new GetCommand({ TableName: TABLE_PIECES, Key: { id: id.value } }),
    );
    return normalizeLegacyVideoUrl(result.Item as Piece | undefined);
  }

  /**
   * @deprecated {@link findPage} を使うこと。`usePiecesAll` 廃止後に削除予定。
   */
  async findAll(): Promise<Piece[]> {
    const items = await scanAllItems<Piece>(TABLE_PIECES); // NOSONAR: typescript:S1874 — 互換維持のため deprecated API を意図的に使用
    return items.map((item) => normalizeLegacyVideoUrl(item) as Piece);
  }

  async findPage(options: {
    limit: number;
    exclusiveStartKey?: Record<string, unknown>;
  }): Promise<{ items: Piece[]; lastEvaluatedKey?: Record<string, unknown> }> {
    const result = await scanPage<Piece>(TABLE_PIECES, options);
    return {
      items: result.items.map((item) => normalizeLegacyVideoUrl(item) as Piece),
      lastEvaluatedKey: result.lastEvaluatedKey,
    };
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
