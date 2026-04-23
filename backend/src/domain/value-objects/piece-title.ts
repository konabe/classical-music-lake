/**
 * 楽曲のタイトルを表す値オブジェクト。
 *
 * - 前後の空白を除去して保持する。
 * - 空文字（空白のみを含む）を拒否する。
 * - 最大 200 文字。
 *
 * プリミティブな `string` との混同を型システムで抑止し、タイトルとしての
 * 不変条件をドメイン層で単独に保証する。
 */
const MAX_LENGTH = 200;

export class PieceTitle {
  public readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static of(value: string): PieceTitle {
    if (typeof value !== "string") {
      throw new TypeError("PieceTitle must be a string");
    }
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      throw new RangeError("PieceTitle must be a non-empty string");
    }
    if (trimmed.length > MAX_LENGTH) {
      throw new RangeError(`PieceTitle must be ${MAX_LENGTH} characters or less`);
    }
    return new PieceTitle(trimmed);
  }

  equals(other: PieceTitle): boolean {
    return other instanceof PieceTitle && this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
