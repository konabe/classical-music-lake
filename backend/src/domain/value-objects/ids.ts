import { randomUUID } from "node:crypto";

/**
 * エンティティ ID の値オブジェクト基底クラス。
 *
 * DDD の値オブジェクトとして ID を表現し、型システム上で他種 ID と混同することを防ぐ。
 * 具象クラスは private なブランドフィールドにより nominal typing を得るため、
 * `PieceId` を `ComposerId` として渡すと TypeScript の型エラーになる。
 *
 * - UUID 形式の厳密な検証は行わない（既存データとの後方互換性のため）。
 *   入力側のスキーマ検証（Zod の `z.uuid()`）と responsibility を分ける。
 * - 空文字・非文字列のみ拒否する。
 */
export abstract class IdValueObject {
  public readonly value: string;

  protected constructor(value: string) {
    if (typeof value !== "string" || value.length === 0) {
      throw new TypeError("ID value object must be a non-empty string");
    }
    this.value = value;
  }

  toString(): string {
    return this.value;
  }

  equals(other: IdValueObject): boolean {
    return this.constructor === other.constructor && this.value === other.value;
  }
}

export class ListeningLogId extends IdValueObject {
  private readonly __brand = "ListeningLogId" as const;

  static from(value: string): ListeningLogId {
    return new ListeningLogId(value);
  }

  static generate(): ListeningLogId {
    return new ListeningLogId(randomUUID());
  }
}

export class ConcertLogId extends IdValueObject {
  private readonly __brand = "ConcertLogId" as const;

  static from(value: string): ConcertLogId {
    return new ConcertLogId(value);
  }

  static generate(): ConcertLogId {
    return new ConcertLogId(randomUUID());
  }
}

export class PieceId extends IdValueObject {
  private readonly __brand = "PieceId" as const;

  static from(value: string): PieceId {
    return new PieceId(value);
  }

  static generate(): PieceId {
    return new PieceId(randomUUID());
  }
}

export class ComposerId extends IdValueObject {
  private readonly __brand = "ComposerId" as const;

  static from(value: string): ComposerId {
    return new ComposerId(value);
  }

  static generate(): ComposerId {
    return new ComposerId(randomUUID());
  }
}

/**
 * Cognito sub を表す値オブジェクト。
 * `generate()` は持たない（外部 IdP が発行する ID のため）。
 */
export class UserId extends IdValueObject {
  private readonly __brand = "UserId" as const;

  static from(value: string): UserId {
    return new UserId(value);
  }
}

/**
 * エンティティ ID のいずれか。汎用ヘルパーの引数型で利用する。
 */
export type EntityId = ListeningLogId | ConcertLogId | PieceId | ComposerId;
