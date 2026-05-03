import { DeleteCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

import type { PieceRepository } from "../domain/piece";
import type { PieceId } from "../domain/value-objects/ids";
import type { Piece, PieceMovement, PieceWork } from "../types";
import { dynamo, putItemWithOptimisticLock, scanPage, TABLE_PIECES } from "../utils/dynamodb";

/**
 * 旧データ（`videoUrl: string`）を新スキーマ（`videoUrls: string[]`）へ正規化する。
 * 1 楽曲に複数動画を持てるようにフィールド名を変更したため、未マイグレーションのレコード
 * を読み込んだ時点で透過的に変換する（書き込みは常に新スキーマのみで行うので、上書きで自然に消える）。
 */
type LegacyVideoUrlPiece = Piece & { videoUrl?: string };

export function normalizeLegacyVideoUrl(item: Piece | undefined): Piece | undefined {
  if (item === undefined) {
    return undefined;
  }
  const legacy = item as LegacyVideoUrlPiece;
  if (legacy.videoUrl === undefined) {
    return item;
  }
  const { videoUrl, ...rest } = legacy;
  if (rest.videoUrls === undefined && typeof videoUrl === "string" && videoUrl !== "") {
    return { ...rest, videoUrls: [videoUrl] } as Piece;
  }
  return rest as Piece;
}

/**
 * 既存 DB レコード（`kind` を持たない）を Composite モデルに合わせて補完する。
 * 既存データは全て Work として扱う（Movement は PR2 以降で書き込みを開始）。
 */
function normalizeKind(item: Piece | undefined): Piece | undefined {
  if (item === undefined) {
    return undefined;
  }
  const candidate = item as Partial<Piece> & Record<string, unknown>;
  if (candidate.kind === "work" || candidate.kind === "movement") {
    return item;
  }
  return { ...(item as object), kind: "work" } as Piece;
}

function readPiece(item: Piece | undefined): Piece | undefined {
  return normalizeKind(normalizeLegacyVideoUrl(item));
}

function isWork(piece: Piece | undefined): piece is PieceWork {
  return piece !== undefined && piece.kind === "work";
}

function isMovement(piece: Piece | undefined): piece is PieceMovement {
  return piece !== undefined && piece.kind === "movement";
}

export class DynamoDBPieceRepository implements PieceRepository {
  async findRootById(id: PieceId): Promise<PieceWork | undefined> {
    const piece = await this.findById(id);
    return isWork(piece) ? piece : undefined;
  }

  async findRootPage(options: {
    limit: number;
    exclusiveStartKey?: Record<string, unknown>;
  }): Promise<{ items: PieceWork[]; lastEvaluatedKey?: Record<string, unknown> }> {
    const result = await scanPage<Piece>(TABLE_PIECES, options);
    const items = result.items.map((item) => readPiece(item)).filter(isWork);
    return {
      items,
      lastEvaluatedKey: result.lastEvaluatedKey,
    };
  }

  async saveWork(work: PieceWork): Promise<void> {
    await dynamo.send(new PutCommand({ TableName: TABLE_PIECES, Item: work }));
  }

  async saveWorkWithOptimisticLock(work: PieceWork, prevUpdatedAt: string): Promise<void> {
    await putItemWithOptimisticLock({
      tableName: TABLE_PIECES,
      item: work,
      prevUpdatedAt,
      conflictMessage: "Piece was updated by another request",
    });
  }

  async removeWorkCascade(id: PieceId): Promise<void> {
    // PR1 時点では Movement が DB に存在しないため、Work 単体の削除と等価。
    // PR2 で findChildren の実装と合わせて子レコードのカスケード削除を有効化する。
    await dynamo.send(new DeleteCommand({ TableName: TABLE_PIECES, Key: { id: id.value } }));
  }

  async findById(id: PieceId): Promise<Piece | undefined> {
    const result = await dynamo.send(
      new GetCommand({ TableName: TABLE_PIECES, Key: { id: id.value } }),
    );
    return readPiece(result.Item as Piece | undefined);
  }

  async findChildren(_parentId: PieceId): Promise<PieceMovement[]> {
    // PR1 時点では Movement の永続化を行わないため空配列。
    // PR2 で GSI（parentId + index）を追加して実装する。
    void _parentId;
    return [];
  }

  async saveMovement(movement: PieceMovement): Promise<void> {
    await dynamo.send(new PutCommand({ TableName: TABLE_PIECES, Item: movement }));
  }

  async saveMovementWithOptimisticLock(
    movement: PieceMovement,
    prevUpdatedAt: string,
  ): Promise<void> {
    await putItemWithOptimisticLock({
      tableName: TABLE_PIECES,
      item: movement,
      prevUpdatedAt,
      conflictMessage: "Piece was updated by another request",
    });
  }

  async removeMovement(id: PieceId): Promise<void> {
    const item = await this.findById(id);
    if (!isMovement(item)) {
      return;
    }
    await dynamo.send(new DeleteCommand({ TableName: TABLE_PIECES, Key: { id: id.value } }));
  }

  async replaceMovements(_workId: PieceId, _movements: PieceMovement[]): Promise<void> {
    // PR3 で実装する。PR1 時点ではエンドポイントが無いためスタブのまま。
    void _workId;
    void _movements;
    throw new Error("replaceMovements is not implemented yet (PR3)");
  }
}
