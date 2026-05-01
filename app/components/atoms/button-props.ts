/**
 * Button atom 群が共通で受け取る props。
 *
 * 新しい Button atom を追加するときは、defineProps の型引数として
 * CommonButtonProps もしくはそれを拡張した型（SubmittableButtonProps 等）を
 * 必ず使うこと。インラインの型リテラルで宣言するとドリフトの原因になる。
 */
export type CommonButtonProps = {
  disabled?: boolean;
};

/**
 * フォーム送信ボタンとしても使われる Button が追加で受け取る props。
 * `type="submit"` を許容するのは Primary のような主アクション用ボタンに限る
 * （Secondary / Danger 等の補助・破壊操作ボタンには付けない）。
 */
export type SubmittableButtonProps = CommonButtonProps & {
  type?: "button" | "submit";
};

/**
 * Button atom 群が共通で公開する slot 契約。
 * `default` slot 経由でラベルを受け取るため、`label` props 等への逸脱を
 * 型レベルで防ぐ目的で定義している。
 */
export type ButtonSlots = {
  default(): unknown;
};
