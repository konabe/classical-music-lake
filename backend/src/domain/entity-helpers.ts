type BaseEntityFields = { id: string; createdAt: string; updatedAt: string };

/**
 * `buildUpdateProps` の入力型。クリア可能フィールドには
 * `null` / 空文字 `""` / 空配列 `[]` をクリア指示として渡せる。
 */
type UpdateInput<TProps extends BaseEntityFields> = {
  [K in keyof TProps]?: TProps[K] | "" | null | readonly unknown[];
};

/**
 * 既存エンティティ props に更新入力をマージし、クリア可能フィールドにクリア指示
 * （`null` / 空文字 `""` / 空配列 `[]`）が渡された場合はそのキーを削除
 * （= DynamoDB の属性削除）する。
 * id / createdAt は不変、updatedAt は常に現在時刻に更新。
 */
export function buildUpdateProps<TProps extends BaseEntityFields>(
  current: TProps,
  input: UpdateInput<TProps>,
  clearableFields: readonly string[],
): TProps {
  const merged = {
    ...current,
    ...(input as Partial<TProps>),
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
  };
  return Object.fromEntries(
    Object.entries(merged).filter(([key, value]) => {
      if (!clearableFields.includes(key)) {
        return true;
      }
      if (value === null) {
        return false;
      }
      if (value === "") {
        return false;
      }
      if (Array.isArray(value) && value.length === 0) {
        return false;
      }
      return true;
    }),
  ) as TProps;
}
