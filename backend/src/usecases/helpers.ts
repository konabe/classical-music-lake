import createError from "http-errors";

import type { EntityId, UserId } from "@/domain/value-objects/ids";
import type { Paginated } from "@/types";
import { encodeCursor } from "@/utils/cursor";

type Owned = { isOwnedBy(userId: UserId): boolean };

/**
 * Repository の findPage 戻り値（items + lastEvaluatedKey）を
 * API レスポンス形式 Paginated<T> に変換する。
 */
export function toPaginatedResult<T>(page: {
  items: T[];
  lastEvaluatedKey?: Record<string, unknown>;
}): Paginated<T> {
  return {
    items: page.items,
    nextCursor: page.lastEvaluatedKey === undefined ? null : encodeCursor(page.lastEvaluatedKey),
  };
}

export async function findByIdOrNotFound<T, I extends EntityId>(
  findById: (id: I) => Promise<T | undefined>,
  id: I,
  entityName: string,
): Promise<T> {
  const item = await findById(id);
  if (item === undefined) {
    throw new createError.NotFound(`${entityName} not found`);
  }
  return item;
}

export async function loadOwnedEntityOrNotFound<
  TItem,
  TEntity extends Owned,
  I extends EntityId,
>(options: {
  findById: (id: I) => Promise<TItem | undefined>;
  reconstruct: (item: TItem) => TEntity;
  id: I;
  userId: UserId;
  entityName: string;
}): Promise<TEntity> {
  const item = await findByIdOrNotFound(options.findById, options.id, options.entityName);
  const entity = options.reconstruct(item);
  if (!entity.isOwnedBy(options.userId)) {
    throw new createError.NotFound(`${options.entityName} not found`);
  }
  return entity;
}
