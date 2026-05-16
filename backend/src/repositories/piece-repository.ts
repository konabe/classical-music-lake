import { TransactionCanceledException } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import createError from "http-errors";

import type { PieceRepository } from "@/domain/piece";
import type { PieceId } from "@/domain/value-objects/ids";
import type { Piece, PieceMovement, PieceWork } from "@/types";
import { dynamo, putItemWithOptimisticLock, scanPage, TABLE_PIECES } from "@/utils/dynamodb";

type LegacyVideoUrlPiece = Piece & { videoUrl?: string };

/**
 * `parentId-index-index` GSI で Movement を演奏順取得するためのインデックス名。
 * CDK の `piecesTable.addGlobalSecondaryIndex` と一致させる。
 */
const MOVEMENTS_GSI_INDEX_NAME = "parentId-index-index";

/**
 * 1 トランザクションで TransactWriteItems に渡せる最大件数（DynamoDB の上限）。
 * 既存子の Delete + 新規 Put + Work 1 件で運用しても収まるよう、ハード上限値で扱う。
 */
const TRANSACT_WRITE_MAX_ITEMS = 100;

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
      return { ...rest, videoUrls: [videoUrl] };
    }
    return rest;
  }

  /**
   * 既存 DB レコード（`kind` を持たない）を Composite モデルに合わせて補完する。
   * `kind` バックフィル移行（PR4）の完了前でも既存データを Work として読めるようにする。
   * 書き込みは常に `kind` を含むため、上書きで自然に正規化される。
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

  private static readPiece(item: Piece | undefined): Piece | undefined {
    return DynamoDBPieceRepository.normalizeLegacyKind(
      DynamoDBPieceRepository.normalizeLegacyVideoUrl(item),
    );
  }

  private static isWork(piece: Piece | undefined): piece is PieceWork {
    return piece?.kind === "work";
  }

  private static isMovement(piece: Piece | undefined): piece is PieceMovement {
    return piece?.kind === "movement";
  }

  async findRootById(id: PieceId): Promise<PieceWork | undefined> {
    const piece = await this.findById(id);
    return DynamoDBPieceRepository.isWork(piece) ? piece : undefined;
  }

  async findRootPage(options: {
    limit: number;
    exclusiveStartKey?: Record<string, unknown>;
  }): Promise<{ items: PieceWork[]; lastEvaluatedKey?: Record<string, unknown> }> {
    const result = await scanPage<Piece>(TABLE_PIECES, options);
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
   * Work 削除時に配下 Movement もまとめて削除する。
   * Movement 集合は `parentId-index-index` GSI から取得し、Work + Movement を
   * 1 つの TransactWriteItems で原子的に削除する。
   */
  async removeWorkCascade(id: PieceId): Promise<void> {
    const children = await this.findChildren(id);
    if (children.length === 0) {
      await dynamo.send(new DeleteCommand({ TableName: TABLE_PIECES, Key: { id: id.value } }));
      return;
    }
    const totalItems = children.length + 1;
    if (totalItems > TRANSACT_WRITE_MAX_ITEMS) {
      throw new Error(
        `Work cascade exceeds DynamoDB transaction limit (${totalItems} > ${TRANSACT_WRITE_MAX_ITEMS})`,
      );
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
    return DynamoDBPieceRepository.readPiece(result.Item as Piece | undefined);
  }

  /**
   * 複数 ID を並列で取得する。BatchGetItem 化への差し替えを見据えた Branch by Abstraction。
   * 個人利用前提でデータ量が小さく、まずは Promise.all で素直に並列発行する。
   */
  async findByIds(ids: readonly PieceId[]): Promise<Piece[]> {
    if (ids.length === 0) {
      return [];
    }
    const results = await Promise.all(ids.map((id) => this.findById(id)));
    return results.filter((p): p is Piece => p !== undefined);
  }

  /**
   * 親 Work 配下の Movement を `parentId-index-index` GSI で `index` 昇順に全件取得する。
   * `Limit` は付けず（楽章は最大 {@link MOVEMENTS_PER_WORK_MAX} 件想定）、
   * 1 ページに収まらない場合は `LastEvaluatedKey` で全件を吸収する。
   */
  async findChildren(parentId: PieceId): Promise<PieceMovement[]> {
    const items: PieceMovement[] = [];
    let exclusiveStartKey: Record<string, unknown> | undefined;
    do {
      const result = await dynamo.send(
        new QueryCommand({
          TableName: TABLE_PIECES,
          IndexName: MOVEMENTS_GSI_INDEX_NAME,
          KeyConditionExpression: "parentId = :parentId",
          ExpressionAttributeValues: { ":parentId": parentId.value },
          ExclusiveStartKey: exclusiveStartKey,
        }),
      );
      const page = (result.Items ?? [])
        .map((raw) => DynamoDBPieceRepository.readPiece(raw as Piece | undefined))
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
   * 既存の子要素を全て削除し、新しい子要素を Put する操作を 1 つの
   * TransactWriteItems で実行する。並び替え・追加・削除の混在も同時に反映される。
   *
   * `workOptimisticLock` を渡すと、Work の楽観的ロック付き Put（条件式: `updatedAt = :prevUpdatedAt`）
   * を同一トランザクションに含めて Work の `updatedAt` も同時に進める。Work の更新が他リクエストと
   * 競合した場合、トランザクション全体がロールバックされる。
   *
   * DynamoDB の TransactWriteItems は 1 トランザクション最大 100 アイテムのため、
   * `(既存件数 + 新規件数 + Work 更新の有無)` が 100 を超える場合はエラーを投げる。
   */
  async replaceMovements(
    workId: PieceId,
    movements: PieceMovement[],
    workOptimisticLock?: { work: PieceWork; prevUpdatedAt: string },
  ): Promise<void> {
    if (movements.some((m) => m.parentId !== workId.value)) {
      throw new Error("All movements must belong to the specified workId");
    }
    const existing = await this.findChildren(workId);
    const workItemCount = workOptimisticLock === undefined ? 0 : 1;
    const totalItems = existing.length + movements.length + workItemCount;
    if (totalItems > TRANSACT_WRITE_MAX_ITEMS) {
      throw new Error(
        `replaceMovements exceeds DynamoDB transaction limit (${totalItems} > ${TRANSACT_WRITE_MAX_ITEMS})`,
      );
    }
    if (totalItems === 0) {
      return;
    }
    const transactItems: NonNullable<
      ConstructorParameters<typeof TransactWriteCommand>[0]["TransactItems"]
    > = [];
    if (workOptimisticLock !== undefined) {
      transactItems.push({
        Put: {
          TableName: TABLE_PIECES,
          Item: workOptimisticLock.work,
          ConditionExpression: "updatedAt = :prevUpdatedAt",
          ExpressionAttributeValues: { ":prevUpdatedAt": workOptimisticLock.prevUpdatedAt },
        },
      });
    }
    existing.forEach((m) => {
      transactItems.push({ Delete: { TableName: TABLE_PIECES, Key: { id: m.id } } });
    });
    movements.forEach((m) => {
      transactItems.push({ Put: { TableName: TABLE_PIECES, Item: m } });
    });
    try {
      await dynamo.send(new TransactWriteCommand({ TransactItems: transactItems }));
    } catch (err) {
      // Work の楽観的ロックが衝突するとトランザクション全体がキャンセルされる。
      // CancellationReasons[0]（Work の Put）が ConditionalCheckFailed であれば 409 Conflict に変換する。
      if (
        err instanceof TransactionCanceledException &&
        workOptimisticLock !== undefined &&
        err.CancellationReasons?.[0]?.Code === "ConditionalCheckFailed"
      ) {
        throw new createError.Conflict("Piece was updated by another request");
      }
      throw err;
    }
  }
}
