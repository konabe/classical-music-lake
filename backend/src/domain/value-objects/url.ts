/**
 * URL を表す値オブジェクト。
 *
 * - 前後の空白を除去して保持する。
 * - 空文字（空白のみを含む）を拒否する。
 * - WHATWG URL パーサー（`URL` コンストラクタ）でパース可能な文字列のみ受理する。
 *
 * プリミティブな `string` との混同を型システムで抑止し、URL としての
 * 不変条件をドメイン層で単独に保証する。videoUrl / imageUrl など
 * URL を扱うフィールド全般で共通利用することを想定している。
 */
export class Url {
  public readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static of(value: string): Url {
    if (typeof value !== "string") {
      throw new TypeError("Url must be a string");
    }
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      throw new RangeError("Url must be a non-empty string");
    }
    try {
      new URL(trimmed);
    } catch {
      throw new RangeError("Url must be a valid URL");
    }
    return new Url(trimmed);
  }

  equals(other: Url): boolean {
    return other instanceof Url && this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
