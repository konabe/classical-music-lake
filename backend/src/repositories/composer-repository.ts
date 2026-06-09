import type { ComposerId } from "@/domain/value-objects/ids";
import { scanPage, TABLE_COMPOSERS } from "@/utils/dynamodb";
import type { Composer } from "@/types";
import type { ComposerRepository } from "@/domain/composer";
import { DynamoDBTableRepository } from "@/repositories/dynamodb-table-repository";

export class DynamoDBComposerRepository
  extends DynamoDBTableRepository<Composer, ComposerId>
  implements ComposerRepository
{
  protected readonly tableName = TABLE_COMPOSERS;
  protected readonly conflictMessage = "Composer was updated by another request";

  async findPage(options: {
    limit: number;
    exclusiveStartKey?: Record<string, unknown>;
  }): Promise<{ items: Composer[]; lastEvaluatedKey?: Record<string, unknown> }> {
    return scanPage<Composer>(TABLE_COMPOSERS, options);
  }
}
