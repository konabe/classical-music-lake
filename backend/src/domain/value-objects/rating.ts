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

export class Rating {
  public readonly value: RatingValue;

  private constructor(value: RatingValue) {
    this.value = value;
  }

  static of(value: number): Rating {
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      throw new RangeError("Rating must be an integer between 1 and 5");
    }
    return new Rating(value as RatingValue);
  }

  equals(other: Rating): boolean {
    return other instanceof Rating && this.value === other.value;
  }

  toString(): string {
    return String(this.value);
  }
}
