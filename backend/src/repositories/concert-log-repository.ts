import { DeleteCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

import type { ConcertLogId, UserId } from "../domain/value-objects/ids";
import {
  dynamo,
  putItemWithOptimisticLock,
  queryItemsByUserId,
  TABLE_CONCERT_LOGS,
} from "../utils/dynamodb";
import type { ConcertLog } from "../types";
import type { ConcertLogRepository } from "../domain/concert-log";

export class DynamoDBConcertLogRepository implements ConcertLogRepository {
  async findById(id: ConcertLogId): Promise<ConcertLog | undefined> {
    const result = await dynamo.send(
      new GetCommand({ TableName: TABLE_CONCERT_LOGS, Key: { id: id.value } }),
    );
    return result.Item as ConcertLog | undefined;
  }

  async findByUserId(userId: UserId): Promise<ConcertLog[]> {
    return queryItemsByUserId<ConcertLog>(TABLE_CONCERT_LOGS, userId.value);
  }

  async save(item: ConcertLog): Promise<void> {
    await dynamo.send(new PutCommand({ TableName: TABLE_CONCERT_LOGS, Item: item }));
  }

  async saveWithOptimisticLock(item: ConcertLog, prevUpdatedAt: string): Promise<void> {
    await putItemWithOptimisticLock({
      tableName: TABLE_CONCERT_LOGS,
      item,
      prevUpdatedAt,
      conflictMessage: "Concert log was updated by another request",
    });
  }

  async remove(id: ConcertLogId): Promise<void> {
    await dynamo.send(new DeleteCommand({ TableName: TABLE_CONCERT_LOGS, Key: { id: id.value } }));
  }
}
