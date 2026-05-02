type BaseEntityFields = { id: string; createdAt: string; updatedAt: string };

/**
 * 既存エンティティ props に更新入力をマージし、クリア可能フィールドにクリア指示
 * （空文字 `""` または空配列 `[]`）が渡された場合はそのキーを削除（= DynamoDB の属性削除）する。
 * id / createdAt は不変、updatedAt は常に現在時刻に更新。
 */
export function buildUpdateProps<TProps extends BaseEntityFields>(
  current: TProps,
  input: Partial<TProps>,
  clearableFields: readonly string[],
): TProps {
  const merged: TProps = {
    ...current,
    ...input,
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
  };
  return Object.fromEntries(
    Object.entries(merged).filter(([key, value]) => {
      if (!clearableFields.includes(key)) {
        return true;
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
