import { NonEmptyText } from "@/domain/value-objects/non-empty-text";

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
export class Url extends NonEmptyText {
  private constructor(value: string) {
    super(value, "Url");
    try {
      new URL(this.value);
    } catch {
      throw new RangeError("Url must be a valid URL");
    }
  }

  static of(value: string): Url {
    return new Url(value);
  }
}
