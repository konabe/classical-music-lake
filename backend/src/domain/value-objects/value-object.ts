/**
 * すべての値オブジェクトの抽象基底。
 *
 * - 不変な `value: T` を保持する。
 * - `equals(other)` は「同じ具象クラス」かつ「`value` が `===` で等しい」のみ `true`。
 *   異なる具象クラス同士は同値でも `false`（`IdValueObject` / `NonEmptyText` /
 *   `BoundedInteger` の歴代方針を踏襲）。
 * - 値オブジェクト固有の不変条件（最大長・範囲・形式など）は派生クラスの
 *   コンストラクタで検証する。本基底は「同一性」と「文字列化」のみを担う。
 */
export abstract class ValueObject<T> {
  public readonly value: T;

  protected constructor(value: T) {
    this.value = value;
  }

  equals(other: unknown): boolean {
    return (
      other instanceof ValueObject &&
      this.constructor === other.constructor &&
      this.value === (other as ValueObject<T>).value
    );
  }

  toString(): string {
    return String(this.value);
  }
}
