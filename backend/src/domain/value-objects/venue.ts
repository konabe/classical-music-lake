/**
 * コンサートの開催会場名を表す値オブジェクト。
 *
 * - 前後の空白を除去して保持する。
 * - 空文字（空白のみを含む）を拒否する。
 * - 最大 200 文字。
 */
const MAX_LENGTH = 200;

export class Venue {
  public readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static of(value: string): Venue {
    if (typeof value !== "string") {
      throw new TypeError("Venue must be a string");
    }
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      throw new RangeError("Venue must be a non-empty string");
    }
    if (trimmed.length > MAX_LENGTH) {
      throw new RangeError(`Venue must be ${MAX_LENGTH} characters or less`);
    }
    return new Venue(trimmed);
  }

  equals(other: Venue): boolean {
    return other instanceof Venue && this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
