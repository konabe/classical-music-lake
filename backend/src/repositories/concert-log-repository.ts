import { DeleteCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

import { dynamo, queryItemsByUserId, updateItem, TABLE_CONCERT_LOGS } from "../utils/dynamodb";
import type { ConcertLog } from "../types";
import type { ConcertLogRepository } from "../domain/concert-log";

export class DynamoDBConcertLogRepository implements ConcertLogRepository {
  async findById(id: string): Promise<ConcertLog | undefined> {
    const result = await dynamo.send(
      new GetCommand({ TableName: TABLE_CONCERT_LOGS, Key: { id } })
    );
    return result.Item as ConcertLog | undefined;
  }

  async findByUserId(userId: string): Promise<ConcertLog[]> {
    return queryItemsByUserId<ConcertLog>(TABLE_CONCERT_LOGS, userId);
  }

  async save(item: ConcertLog): Promise<void> {
    await dynamo.send(new PutCommand({ TableName: TABLE_CONCERT_LOGS, Item: item }));
  }

  async update(id: string, input: Partial<ConcertLog>): Promise<ConcertLog> {
    return updateItem<ConcertLog>(TABLE_CONCERT_LOGS, id, input);
  }

  async remove(id: string): Promise<void> {
    await dynamo.send(new DeleteCommand({ TableName: TABLE_CONCERT_LOGS, Key: { id } }));
  }
}
