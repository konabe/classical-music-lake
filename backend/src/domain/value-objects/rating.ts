import { BoundedInteger } from "@/domain/value-objects/bounded-integer";

/**
 * 鑑賞ログの評価を表す値オブジェクト。
 *
 * 1〜5 の整数のみを許容する。ドメイン層で不正な値の流入を防ぎ、
 * プリミティブな `number` との混同を型システムで抑止する。
 *
 * - 入力側の型検証（Zod）と二重になるが、ドメイン層の不変条件を単独で保証する責務を持つ。
 * - 値の取り出しは `.value`（`1 | 2 | 3 | 4 | 5` の narrow な型）または `toString()`。
 */
export type RatingValue = 1 | 2 | 3 | 4 | 5;

export class Rating extends BoundedInteger<RatingValue> {
  private constructor(value: number) {
    super(value, "Rating", 1, 5);
  }

  static of(value: number): Rating {
    return new Rating(value);
  }
}
