type BaseEntityFields = { id: string; createdAt: string; updatedAt: string };

/**
 * 既存エンティティ props に更新入力をマージし、クリア可能フィールドに空文字が渡された場合は
 * そのキーを削除（= DynamoDB の属性削除）する。id / createdAt は不変、updatedAt は常に現在時刻に更新。
 */
export function buildUpdateProps<TProps extends BaseEntityFields>(
  current: TProps,
  input: Partial<TProps>,
  clearableFields: readonly string[]
): TProps {
  const merged: TProps = {
    ...current,
    ...input,
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
  };
  return Object.fromEntries(
    Object.entries(merged).filter(([key, value]) => !clearableFields.includes(key) || value !== "")
  ) as TProps;
}
