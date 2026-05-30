import { BoundedInteger } from "@/domain/value-objects/bounded-integer";

/**
 * 西暦の年を表す値オブジェクト。
 *
 * - 整数のみ受理。負数は紀元前を表す（例: -750）。
 * - 範囲は -3000 〜 9999。クラシック作曲家の歴史的範囲をカバー。
 * - 値の取り出しは `.value` または `toString()`、等価判定は `.equals(other)`。
 */
const MIN_YEAR = -3000;
const MAX_YEAR = 9999;

export class Year extends BoundedInteger {
  private constructor(value: number) {
    super(value, "Year", MIN_YEAR, MAX_YEAR);
  }

  static of(value: number): Year {
    return new Year(value);
  }
}
