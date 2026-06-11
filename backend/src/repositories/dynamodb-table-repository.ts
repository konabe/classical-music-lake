import { DeleteCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

import { dynamo, putItemWithOptimisticLock } from "@/utils/dynamodb";

/** ID 値オブジェクト（`IdValueObject`）に求める構造的な最小要件。 */
type EntityIdLike = { readonly value: string };

/**
 * `id` を PK とする DynamoDB テーブルの共通 CRUD 実装。
 * 各リポジトリは `tableName` と `conflictMessage` を指定し、テーブル固有の
 * クエリ（GSI 検索・ページング・トランザクション等）のみを実装する。
 */
export abstract class DynamoDBTableRepository<TItem, TId extends EntityIdLike> {
  protected abstract readonly tableName: string;

  /** 楽観的ロック競合時に 409 Conflict へ載せるメッセージ。 */
  protected abstract readonly conflictMessage: string;

  async findById(id: TId): Promise<TItem | undefined> {
    const result = await dynamo.send(
      new GetCommand({ TableName: this.tableName, Key: { id: id.value } }),
    );
    return result.Item as TItem | undefined;
  }

  /**
   * 複数 ID を並列で取得する（重複は呼び出し側で排除する前提）。
   * 戻り値は見つかったものだけを含み、`id` の順序は保証しない。
   * 現状は `Promise.all(findById)` の並列発行で、BatchGetItem への差し替え用フック
   * （Branch by Abstraction）。
   */
  async findByIds(ids: readonly TId[]): Promise<TItem[]> {
    if (ids.length === 0) {
      return [];
    }
    const results = await Promise.all(ids.map((id) => this.findById(id)));
    return results.filter((item): item is Awaited<TItem> => item !== undefined);
  }

  async save(item: TItem): Promise<void> {
    await dynamo.send(new PutCommand({ TableName: this.tableName, Item: item }));
  }

  async saveWithOptimisticLock(item: TItem, prevUpdatedAt: string): Promise<void> {
    await putItemWithOptimisticLock({
      tableName: this.tableName,
      item,
      prevUpdatedAt,
      conflictMessage: this.conflictMessage,
    });
  }

  async remove(id: TId): Promise<void> {
    await dynamo.send(new DeleteCommand({ TableName: this.tableName, Key: { id: id.value } }));
  }
}
