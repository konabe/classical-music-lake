type BaseEntityFields = { id: string; createdAt: string; updatedAt: string };

/**
 * 新規エンティティ用のメタデータ（id / createdAt / updatedAt）を付与した props を生成する。
 * Composer / Piece のような admin 管理エンティティで共通利用する。
 *
 * `id` は呼び出し側の ID 値オブジェクト（例: `PieceId.generate()`）から渡すことで、
 * エンティティ種別ごとに正しい ID 型を使っていることを呼び出し側で保証させる。
 */
export function buildCreateProps<TInput extends object, TProps extends TInput & BaseEntityFields>(
  input: TInput,
  id: string
): TProps {
  const now = new Date().toISOString();
  return { ...input, id, createdAt: now, updatedAt: now } as TProps;
}

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
