import { ValueObject } from "@/domain/value-objects/value-object";

/**
 * 「前後の空白を除去し、空文字を拒否する文字列」を表す値オブジェクトの基底。
 *
 * - 文字列以外は `TypeError`、trim 後に空文字なら `RangeError` を投げる。
 * - 等価判定・`toString` は `ValueObject` の実装に従う。
 */
export abstract class NonEmptyText extends ValueObject<string> {
  protected constructor(value: string, label: string) {
    if (typeof value !== "string") {
      throw new TypeError(`${label} must be a string`);
    }
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      throw new RangeError(`${label} must be a non-empty string`);
    }
    super(trimmed);
  }
}

/**
 * `NonEmptyText` に「最大文字数」の不変条件を加えた基底。
 * 文字数は trim 後の長さで判定する。
 */
export abstract class BoundedText extends NonEmptyText {
  protected constructor(value: string, label: string, maxLength: number) {
    super(value, label);
    if (this.value.length > maxLength) {
      throw new RangeError(`${label} must be ${maxLength} characters or less`);
    }
  }
}
