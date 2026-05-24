/**
 * 「指定された範囲内の整数」を表す値オブジェクトの基底。
 *
 * - 整数以外（非数値・非整数・NaN・Infinity）は `RangeError` を投げる。
 * - 範囲外も `RangeError` を投げる。
 * - 等価判定は「同じ具象クラス」かつ「同じ値」のときのみ `true`。
 *
 * 型パラメータ `T` で `.value` の型を絞れる（例: `Rating` は `1 | 2 | 3 | 4 | 5`）。
 */
export abstract class BoundedInteger<T extends number = number> {
  public readonly value: T;

  protected constructor(value: number, label: string, min: number, max: number) {
    if (typeof value !== "number" || !Number.isInteger(value)) {
      throw new RangeError(`${label} must be an integer`);
    }
    if (value < min || value > max) {
      throw new RangeError(`${label} must be between ${min} and ${max}`);
    }
    this.value = value as T;
  }

  equals(other: unknown): boolean {
    return (
      other instanceof BoundedInteger &&
      this.constructor === other.constructor &&
      this.value === other.value
    );
  }

  toString(): string {
    return String(this.value);
  }
}
