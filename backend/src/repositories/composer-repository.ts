import { DeleteCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

import type { ComposerId } from "../domain/value-objects/ids";
import { dynamo, putItemWithOptimisticLock, scanPage, TABLE_COMPOSERS } from "../utils/dynamodb";
import type { Composer } from "../types";
import type { ComposerRepository } from "../domain/composer";

export class DynamoDBComposerRepository implements ComposerRepository {
  async findById(id: ComposerId): Promise<Composer | undefined> {
    const result = await dynamo.send(
      new GetCommand({ TableName: TABLE_COMPOSERS, Key: { id: id.value } }),
    );
    return result.Item as Composer | undefined;
  }

  async findPage(options: {
    limit: number;
    exclusiveStartKey?: Record<string, unknown>;
  }): Promise<{ items: Composer[]; lastEvaluatedKey?: Record<string, unknown> }> {
    return scanPage<Composer>(TABLE_COMPOSERS, options);
  }

  async save(item: Composer): Promise<void> {
    await dynamo.send(new PutCommand({ TableName: TABLE_COMPOSERS, Item: item }));
  }

  async saveWithOptimisticLock(item: Composer, prevUpdatedAt: string): Promise<void> {
    await putItemWithOptimisticLock({
      tableName: TABLE_COMPOSERS,
      item,
      prevUpdatedAt,
      conflictMessage: "Composer was updated by another request",
    });
  }

  async remove(id: ComposerId): Promise<void> {
    await dynamo.send(new DeleteCommand({ TableName: TABLE_COMPOSERS, Key: { id: id.value } }));
  }
}
