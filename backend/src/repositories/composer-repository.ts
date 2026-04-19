import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import createError from "http-errors";

import { dynamo, scanPage, TABLE_COMPOSERS } from "../utils/dynamodb";
import type { Composer } from "../types";
import type { ComposerRepository } from "../domain/composer";

export class DynamoDBComposerRepository implements ComposerRepository {
  async findById(id: string): Promise<Composer | undefined> {
    const result = await dynamo.send(new GetCommand({ TableName: TABLE_COMPOSERS, Key: { id } }));
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
    try {
      await dynamo.send(
        new PutCommand({
          TableName: TABLE_COMPOSERS,
          Item: item,
          ConditionExpression: "updatedAt = :prevUpdatedAt",
          ExpressionAttributeValues: { ":prevUpdatedAt": prevUpdatedAt },
        })
      );
    } catch (err) {
      if (err instanceof ConditionalCheckFailedException) {
        throw new createError.Conflict("Composer was updated by another request");
      }
      throw err;
    }
  }

  async remove(id: string): Promise<void> {
    await dynamo.send(new DeleteCommand({ TableName: TABLE_COMPOSERS, Key: { id } }));
  }
}
