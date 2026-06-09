import type { ConcertLogId, UserId } from "@/domain/value-objects/ids";
import { queryItemsByUserId, TABLE_CONCERT_LOGS } from "@/utils/dynamodb";
import type { ConcertLog } from "@/types";
import type { ConcertLogRepository } from "@/domain/concert-log";
import { DynamoDBTableRepository } from "@/repositories/dynamodb-table-repository";

export class DynamoDBConcertLogRepository
  extends DynamoDBTableRepository<ConcertLog, ConcertLogId>
  implements ConcertLogRepository
{
  protected readonly tableName = TABLE_CONCERT_LOGS;
  protected readonly conflictMessage = "Concert log was updated by another request";

  async findByUserId(userId: UserId): Promise<ConcertLog[]> {
    return queryItemsByUserId<ConcertLog>(TABLE_CONCERT_LOGS, userId.value);
  }
}
