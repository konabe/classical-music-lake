/**
 * 作曲家の名前を表す値オブジェクト。
 *
 * - 前後の空白を除去して保持する。
 * - 空文字（空白のみを含む）を拒否する。
 * - 最大 100 文字。
 */
const MAX_LENGTH = 100;

export class ComposerName {
  public readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static of(value: string): ComposerName {
    if (typeof value !== "string") {
      throw new TypeError("ComposerName must be a string");
    }
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      throw new RangeError("ComposerName must be a non-empty string");
    }
    if (trimmed.length > MAX_LENGTH) {
      throw new RangeError(`ComposerName must be ${MAX_LENGTH} characters or less`);
    }
    return new ComposerName(trimmed);
  }

  equals(other: ComposerName): boolean {
    return other instanceof ComposerName && this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
