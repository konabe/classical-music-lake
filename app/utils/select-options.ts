/**
 * 文字列の readonly 配列を SelectInput の options 形式（{ value, label }）に変換する。
 * Piece / Composer など、列挙型の定数配列をフォームの選択肢に流し込むときに使う。
 */
export function toSelectOptions<T extends string>(
  values: readonly T[]
): { value: T; label: string }[] {
  return values.map((v) => ({ value: v, label: v }));
}
