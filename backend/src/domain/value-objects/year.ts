/**
 * 西暦の年を表す値オブジェクト。
 *
 * - 整数のみ受理。負数は紀元前を表す（例: -750）。
 * - 範囲は -3000 〜 9999。クラシック作曲家の歴史的範囲をカバー。
 * - 値の取り出しは `.value` または `toString()`、等価判定は `.equals(other)`。
 */
const MIN_YEAR = -3000;
const MAX_YEAR = 9999;

export class Year {
  public readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  static of(value: number): Year {
    if (typeof value !== "number" || !Number.isInteger(value)) {
      throw new RangeError("Year must be an integer");
    }
    if (value < MIN_YEAR || value > MAX_YEAR) {
      throw new RangeError(`Year must be between ${MIN_YEAR} and ${MAX_YEAR}`);
    }
    return new Year(value);
  }

  equals(other: Year): boolean {
    return other instanceof Year && this.value === other.value;
  }

  toString(): string {
    return String(this.value);
  }
}
