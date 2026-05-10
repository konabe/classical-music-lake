/**
 * コンサートのタイトルを表す値オブジェクト。
 *
 * - 前後の空白を除去して保持する。
 * - 空文字（空白のみを含む）を拒否する。
 * - 最大 200 文字。
 */
const MAX_LENGTH = 200;

export class ConcertTitle {
  public readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static of(value: string): ConcertTitle {
    if (typeof value !== "string") {
      throw new TypeError("ConcertTitle must be a string");
    }
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      throw new RangeError("ConcertTitle must be a non-empty string");
    }
    if (trimmed.length > MAX_LENGTH) {
      throw new RangeError(`ConcertTitle must be ${MAX_LENGTH} characters or less`);
    }
    return new ConcertTitle(trimmed);
  }

  equals(other: ConcertTitle): boolean {
    return other instanceof ConcertTitle && this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
