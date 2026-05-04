import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";

import type { PieceRepository } from "../domain/piece";
import type { PieceId } from "../domain/value-objects/ids";
import type { Piece, PieceMovement, PieceWork } from "../types";
import { dynamo, putItemWithOptimisticLock, scanPage, TABLE_PIECES } from "../utils/dynamodb";

/**
 * DynamoDB に永続化される楽曲レコードの正準型（内部 DTO）。
 * Work / Movement を 1 テーブルに格納するため、`kind` で判別し、Movement のみが
 * `parentId` / `index` を持つ。`videoUrls` は両方が共通で持つ。
 *
 * `kind` 欠落・旧 `videoUrl` （単一）など過渡期の形式は `readPiece` で正規化する。
 */
type PieceRecord = (PieceWork | PieceMovement) & {
  // 旧データ（PR1 以前のレコード）には kind が無いため optional にする。
  // readPiece 時に "work" として透過正規化される。
  kind?: "work" | "movement";
};

type LegacyVideoUrlPiece = Piece & { videoUrl?: string };

/** 楽章一覧取得用の GSI 名。`parentId`（PK）+ `index`（SK）。 */
const MOVEMENTS_GSI = "parentId-index-index";

export class DynamoDBPieceRepository implements PieceRepository {
  /**
   * 旧データ（`videoUrl: string`）を新スキーマ（`videoUrls: string[]`）へ正規化する。
   * 1 楽曲に複数動画を持てるようにフィールド名を変更したため、未マイグレーションのレコード
   * を読み込んだ時点で透過的に変換する（書き込みは常に新スキーマのみで行うので、上書きで自然に消える）。
   */
  static normalizeLegacyVideoUrl(item: Piece | undefined): Piece | undefined {
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
   * 既存データは全て Work として扱う（Movement は本 PR2 から書き込みを開始するため、
   * 過去データには Movement レコードは存在しない）。
   */
  static normalizeLegacyKind(item: Piece | undefined): Piece | undefined {
    if (item === undefined) {
      return undefined;
    }
    const candidate = item as Partial<Piece> & Record<string, unknown>;
    if (candidate.kind === "work" || candidate.kind === "movement") {
      return item;
    }
    return { ...(item as object), kind: "work" } as Piece;
  }

  private static readPiece(item: PieceRecord | undefined): Piece | undefined {
    return DynamoDBPieceRepository.normalizeLegacyKind(
      DynamoDBPieceRepository.normalizeLegacyVideoUrl(item as Piece | undefined),
    );
  }

  private static isWork(piece: Piece | undefined): piece is PieceWork {
    if (piece === undefined || piece.kind !== "work") {
      return false;
    }
    // Composite 構造を厳密化するため、Movement 専用フィールド `parentId` を持つレコードは
    // Work とみなさない（誤って kind=work として書き込まれた壊れたレコードを除外する）。
    return (piece as PieceWork & { parentId?: string }).parentId === undefined;
  }

  private static isMovement(piece: Piece | undefined): piece is PieceMovement {
    return piece !== undefined && piece.kind === "movement";
  }

  async findRootById(id: PieceId): Promise<PieceWork | undefined> {
    const piece = await this.findById(id);
    return DynamoDBPieceRepository.isWork(piece) ? piece : undefined;
  }

  async findRootPage(options: {
    limit: number;
    exclusiveStartKey?: Record<string, unknown>;
  }): Promise<{ items: PieceWork[]; lastEvaluatedKey?: Record<string, unknown> }> {
    const result = await scanPage<PieceRecord>(TABLE_PIECES, options);
    const items = result.items
      .map((item) => DynamoDBPieceRepository.readPiece(item))
      .filter(DynamoDBPieceRepository.isWork);
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

  /**
   * Work とその配下の Movement をまとめて削除する。
   * - 既存の Movement を GSI Query で全件取得し、TransactWriteItems で Work + Movement を一括 Delete する。
   * - 子レコードが無い場合は Work のみの単発 Delete に縮退する。
   *
   * トランザクションには `Delete` の同一テーブル上限 100 件があるが、
   * Movement は 1 Work あたり最大 64 件（{@link MOVEMENTS_PER_WORK_MAX}）に制限しているため
   * +Work 1 件で必ず収まる。
   */
  async removeWorkCascade(id: PieceId): Promise<void> {
    const children = await this.findChildren(id);
    if (children.length === 0) {
      await dynamo.send(new DeleteCommand({ TableName: TABLE_PIECES, Key: { id: id.value } }));
      return;
    }
    await dynamo.send(
      new TransactWriteCommand({
        TransactItems: [
          { Delete: { TableName: TABLE_PIECES, Key: { id: id.value } } },
          ...children.map((m) => ({
            Delete: { TableName: TABLE_PIECES, Key: { id: m.id } },
          })),
        ],
      }),
    );
  }

  async findById(id: PieceId): Promise<Piece | undefined> {
    const result = await dynamo.send(
      new GetCommand({ TableName: TABLE_PIECES, Key: { id: id.value } }),
    );
    return DynamoDBPieceRepository.readPiece(result.Item as PieceRecord | undefined);
  }

  /**
   * Work 配下の Movement を `parentId-index-index` GSI で全件取得する（`index` 昇順）。
   * - `Limit` は付与しない。1 Work あたりの Movement は {@link MOVEMENTS_PER_WORK_MAX}
   *   に制限しているため、ページングは不要。
   * - 念のため `LastEvaluatedKey` がある場合は継続クエリしてすべて回収する。
   */
  async findChildren(parentId: PieceId): Promise<PieceMovement[]> {
    const items: PieceMovement[] = [];
    let exclusiveStartKey: Record<string, unknown> | undefined;
    do {
      const result = await dynamo.send(
        new QueryCommand({
          TableName: TABLE_PIECES,
          IndexName: MOVEMENTS_GSI,
          KeyConditionExpression: "parentId = :parentId",
          ExpressionAttributeValues: { ":parentId": parentId.value },
          ExclusiveStartKey: exclusiveStartKey,
        }),
      );
      const page = (result.Items ?? [])
        .map((item) => DynamoDBPieceRepository.readPiece(item as PieceRecord))
        .filter(DynamoDBPieceRepository.isMovement);
      items.push(...page);
      exclusiveStartKey = result.LastEvaluatedKey as Record<string, unknown> | undefined;
    } while (exclusiveStartKey !== undefined);
    return items;
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
    if (!DynamoDBPieceRepository.isMovement(item)) {
      return;
    }
    await dynamo.send(new DeleteCommand({ TableName: TABLE_PIECES, Key: { id: id.value } }));
  }

  /**
   * Work 配下の Movement 集合をアトミックに置換する。
   * - 既存子の Delete + 新規子の Put を 1 つの TransactWriteItems にまとめる。
   * - 入力 `movements` の `parentId` はすべて `workId` と一致している必要がある（呼び出し側で保証）。
   * - 1 件も指定されない場合は単純に既存子を全削除する。
   *
   * DynamoDB TransactWriteItems の上限は 100 アクション。
   * Movement は 1 Work あたり最大 64 件（{@link MOVEMENTS_PER_WORK_MAX}）なので、
   * 旧 + 新で最悪 128 件になり得るが、本実装では「旧子の全削除 + 新子の Put」を
   * 1 トランザクションで実行するため、利用側で `MOVEMENTS_PER_WORK_MAX` を遵守すれば
   * 上限内に収まる（Zod スキーマで上限チェック済み）。
   */
  async replaceMovements(workId: PieceId, movements: PieceMovement[]): Promise<void> {
    const existing = await this.findChildren(workId);
    if (existing.length === 0 && movements.length === 0) {
      return;
    }
    const transactItems = [
      ...existing.map((m) => ({
        Delete: { TableName: TABLE_PIECES, Key: { id: m.id } },
      })),
      ...movements.map((m) => ({
        Put: { TableName: TABLE_PIECES, Item: m },
      })),
    ];
    await dynamo.send(new TransactWriteCommand({ TransactItems: transactItems }));
  }
}
