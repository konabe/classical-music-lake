import { DeleteCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

import { dynamo, queryItemsByUserId, updateItem, TABLE_LISTENING_LOGS } from "../utils/dynamodb";
import type { ListeningLog } from "../types";
import type { ListeningLogRepository } from "../domain/listening-log";

export class DynamoDBListeningLogRepository implements ListeningLogRepository {
  async findById(id: string): Promise<ListeningLog | undefined> {
    const result = await dynamo.send(
      new GetCommand({ TableName: TABLE_LISTENING_LOGS, Key: { id } })
    );
    return result.Item as ListeningLog | undefined;
  }

  async findByUserId(userId: string): Promise<ListeningLog[]> {
    return queryItemsByUserId<ListeningLog>(TABLE_LISTENING_LOGS, userId);
  }

  async save(item: ListeningLog): Promise<void> {
    await dynamo.send(new PutCommand({ TableName: TABLE_LISTENING_LOGS, Item: item }));
  }

  async update(id: string, input: Partial<ListeningLog>): Promise<ListeningLog> {
    return updateItem<ListeningLog>(TABLE_LISTENING_LOGS, id, input);
  }

  async remove(id: string): Promise<void> {
    await dynamo.send(new DeleteCommand({ TableName: TABLE_LISTENING_LOGS, Key: { id } }));
  }
}
