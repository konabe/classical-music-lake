import { DeleteCommand, GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

import type { ListeningLogId, PieceId, UserId } from "@/domain/value-objects/ids";
import {
  dynamo,
  putItemWithOptimisticLock,
  queryItemsByUserId,
  TABLE_LISTENING_LOGS,
} from "@/utils/dynamodb";
import type { ListeningLogRecord } from "@/types";
import type { ListeningLogRepository } from "@/domain/listening-log";

export class DynamoDBListeningLogRepository implements ListeningLogRepository {
  async findById(id: ListeningLogId): Promise<ListeningLogRecord | undefined> {
    const result = await dynamo.send(
      new GetCommand({ TableName: TABLE_LISTENING_LOGS, Key: { id: id.value } }),
    );
    return result.Item as ListeningLogRecord | undefined;
  }

  async findByUserId(userId: UserId): Promise<ListeningLogRecord[]> {
    return queryItemsByUserId<ListeningLogRecord>(TABLE_LISTENING_LOGS, userId.value);
  }

  /**
   * 指定 pieceId 群のいずれかに紐付く ListeningLog が 1 件でも存在するかを返す（Piece 削除時のガード用）。
   *
   * 専用 GSI を持たないため Scan + FilterExpression(`pieceId IN (...)`) を使う（個人利用前提でデータ量小）。
   * Work 削除時は `[workId, ...childMovementIds]` をまとめて渡すことで 1 回の Scan で判定できる。
   * DynamoDB の IN 演算子は最大 100 値（MOVEMENTS_PER_WORK_MAX=49 + 1 で十分収まる）。
   * データ量が増えたら `pieceId-index` GSI の追加を検討すること。
   */
  async existsByPieceIds(pieceIds: PieceId[]): Promise<boolean> {
    if (pieceIds.length === 0) {
      return false;
    }
    const placeholders = pieceIds.map((_, i) => `:p${i}`).join(", ");
    const expressionAttributeValues: Record<string, string> = {};
    pieceIds.forEach((id, i) => {
      expressionAttributeValues[`:p${i}`] = id.value;
    });
    let exclusiveStartKey: Record<string, unknown> | undefined;
    do {
      const result = await dynamo.send(
        new ScanCommand({
          TableName: TABLE_LISTENING_LOGS,
          FilterExpression: `pieceId IN (${placeholders})`,
          ExpressionAttributeValues: expressionAttributeValues,
          ExclusiveStartKey: exclusiveStartKey,
        }),
      );
      if ((result.Items ?? []).length > 0) {
        return true;
      }
      exclusiveStartKey = result.LastEvaluatedKey as Record<string, unknown> | undefined;
    } while (exclusiveStartKey !== undefined);
    return false;
  }

  async save(item: ListeningLogRecord): Promise<void> {
    await dynamo.send(new PutCommand({ TableName: TABLE_LISTENING_LOGS, Item: item }));
  }

  async saveWithOptimisticLock(item: ListeningLogRecord, prevUpdatedAt: string): Promise<void> {
    await putItemWithOptimisticLock({
      tableName: TABLE_LISTENING_LOGS,
      item,
      prevUpdatedAt,
      conflictMessage: "Listening log was updated by another request",
    });
  }

  async remove(id: ListeningLogId): Promise<void> {
    await dynamo.send(
      new DeleteCommand({ TableName: TABLE_LISTENING_LOGS, Key: { id: id.value } }),
    );
  }
}
