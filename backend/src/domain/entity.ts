import type { IdValueObject } from "./value-objects/ids";

export type EntityProps<TId extends IdValueObject> = {
  id: TId;
  createdAt: string;
  updatedAt: string;
};

/**
 * DDD のエンティティ基底クラス。
 *
 * - `id` / `createdAt` / `updatedAt` の保持と getter を共通化する
 * - `equals` は「同じ具象クラス かつ 同じ ID」をエンティティの等価条件として実装する
 *   （IdValueObject.equals が constructor 比較を含むため、ここでも明示的に揃える）
 */
export abstract class Entity<TId extends IdValueObject, TProps extends EntityProps<TId>> {
  protected constructor(protected readonly props: TProps) {}

  get id(): TId {
    return this.props.id;
  }

  get createdAt(): string {
    return this.props.createdAt;
  }

  get updatedAt(): string {
    return this.props.updatedAt;
  }

  equals(other: unknown): boolean {
    if (!(other instanceof Entity)) {
      return false;
    }
    if (this.constructor !== other.constructor) {
      return false;
    }
    return this.id.equals(other.id);
  }
}
