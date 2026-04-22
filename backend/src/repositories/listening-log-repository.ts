import { DeleteCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

import type { ListeningLogId, UserId } from "../domain/value-objects/ids";
import { dynamo, queryItemsByUserId, updateItem, TABLE_LISTENING_LOGS } from "../utils/dynamodb";
import type { ListeningLog } from "../types";
import type { ListeningLogRepository } from "../domain/listening-log";

export class DynamoDBListeningLogRepository implements ListeningLogRepository {
  async findById(id: ListeningLogId): Promise<ListeningLog | undefined> {
    const result = await dynamo.send(
      new GetCommand({ TableName: TABLE_LISTENING_LOGS, Key: { id: id.value } })
    );
    return result.Item as ListeningLog | undefined;
  }

  async findByUserId(userId: UserId): Promise<ListeningLog[]> {
    return queryItemsByUserId<ListeningLog>(TABLE_LISTENING_LOGS, userId.value);
  }

  async save(item: ListeningLog): Promise<void> {
    await dynamo.send(new PutCommand({ TableName: TABLE_LISTENING_LOGS, Item: item }));
  }

  async update(id: ListeningLogId, input: Partial<ListeningLog>): Promise<ListeningLog> {
    return updateItem<ListeningLog>(TABLE_LISTENING_LOGS, id.value, input);
  }

  async remove(id: ListeningLogId): Promise<void> {
    await dynamo.send(
      new DeleteCommand({ TableName: TABLE_LISTENING_LOGS, Key: { id: id.value } })
    );
  }
}
