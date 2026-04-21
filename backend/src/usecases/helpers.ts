import createError from "http-errors";

type Owned = { isOwnedBy(userId: string): boolean };

export async function findByIdOrNotFound<T>(
  findById: (id: string) => Promise<T | undefined>,
  id: string,
  entityName: string
): Promise<T> {
  const item = await findById(id);
  if (item === undefined) {
    throw new createError.NotFound(`${entityName} not found`);
  }
  return item;
}

export async function loadOwnedEntityOrNotFound<TItem, TEntity extends Owned>(options: {
  findById: (id: string) => Promise<TItem | undefined>;
  reconstruct: (item: TItem) => TEntity;
  id: string;
  userId: string;
  entityName: string;
}): Promise<TEntity> {
  const item = await findByIdOrNotFound(options.findById, options.id, options.entityName);
  const entity = options.reconstruct(item);
  if (!entity.isOwnedBy(options.userId)) {
    throw new createError.NotFound(`${options.entityName} not found`);
  }
  return entity;
}
