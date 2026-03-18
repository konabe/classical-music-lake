# 設計: ワーク4 楽曲削除

## バックエンド

### Lambda: `backend/src/pieces/delete.ts`

```typescript
export const handler = createHandler(async (event) => {
  const id = event.pathParameters?.id;
  if (!id) throw new createError.BadRequest("id is required");

  await dynamo.send(new DeleteCommand({ TableName: TABLE_PIECES, Key: { id } }));
  return { statusCode: StatusCodes.NO_CONTENT, body: "" };
});
```

### CDK

```typescript
const deletePiece = fn("DeletePiece", "pieces/delete.ts");
piecesTable.grantWriteData(deletePiece);
pieceById.addMethod("DELETE", new apigateway.LambdaIntegration(deletePiece));
```

---

## フロントエンド

### `pages/pieces/index.vue` 更新

- 削除ボタンに確認ダイアログ（`confirm()`）を追加
- `DELETE /pieces/{id}` を呼び出し、成功後に一覧を再取得

---

## レビュー結果

<!-- レビュー後にここに記載 -->
