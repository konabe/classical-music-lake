import { ValueObject } from "@/domain/value-objects/value-object";

/**
 * 「指定された範囲内の整数」を表す値オブジェクトの基底。
 *
 * - 整数以外（非数値・非整数・NaN・Infinity）は `RangeError` を投げる。
 * - 範囲外も `RangeError` を投げる。
 * - 等価判定・`toString` は `ValueObject` の実装に従う。
 *
 * 型パラメータ `T` で `.value` の型を絞れる（例: `Rating` は `1 | 2 | 3 | 4 | 5`）。
 */
export abstract class BoundedInteger<T extends number = number> extends ValueObject<T> {
  protected constructor(value: number, label: string, min: number, max: number) {
    if (typeof value !== "number" || !Number.isInteger(value)) {
      throw new RangeError(`${label} must be an integer`);
    }
    if (value < min || value > max) {
      throw new RangeError(`${label} must be between ${min} and ${max}`);
    }
    super(value as T);
  }
}
