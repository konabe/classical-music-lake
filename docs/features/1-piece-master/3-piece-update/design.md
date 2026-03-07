# 設計: ワーク3 楽曲編集

## バックエンド

### Lambda: `backend/src/pieces/get.ts`

```typescript
export const handler = createHandler(async (event) => {
  const id = event.pathParameters?.id;
  if (!id) throw new createError.BadRequest("id is required");

  const result = await dynamo.send(new GetCommand({ TableName: TABLE_PIECES, Key: { id } }));
  if (!result.Item) throw new createError.NotFound("Piece not found");
  return { statusCode: StatusCodes.OK, body: result.Item as Piece };
});
```

### Lambda: `backend/src/pieces/update.ts`

```typescript
export const handler = createHandler(async (event) => {
  const id = event.pathParameters?.id;
  if (!id) throw new createError.BadRequest("id is required");
  if (!event.body) throw new createError.BadRequest("Request body is required");

  let input: UpdatePieceInput;
  try {
    input = JSON.parse(event.body);
  } catch {
    throw new createError.BadRequest("Invalid JSON");
  }

  const existing = await dynamo.send(new GetCommand({ TableName: TABLE_PIECES, Key: { id } }));
  if (!existing.Item) throw new createError.NotFound("Piece not found");

  const updated: Piece = {
    ...(existing.Item as Piece),
    ...input,
    id,
    createdAt: (existing.Item as Piece).createdAt,
    updatedAt: new Date().toISOString(),
  };
  await dynamo.send(new PutCommand({ TableName: TABLE_PIECES, Item: updated }));
  return { statusCode: StatusCodes.OK, body: updated };
});
```

### CDK

```typescript
const pieceById = pieces.addResource("{id}");

const getPiece = fn("GetPiece", "pieces/get.ts");
piecesTable.grantReadData(getPiece);
pieceById.addMethod("GET", new apigateway.LambdaIntegration(getPiece));

const updatePiece = fn("UpdatePiece", "pieces/update.ts");
piecesTable.grantReadWriteData(updatePiece);
pieceById.addMethod("PUT", new apigateway.LambdaIntegration(updatePiece));
```

---

## フロントエンド

### ページ: `pages/pieces/[id]/edit.vue`

- `GET /pieces/{id}` で現在の値を取得し、フォームの初期値にセット
- `PUT /pieces/{id}` を呼び出し、成功後に `/pieces` へリダイレクト
- 存在しない ID の場合はエラーメッセージを表示

### `pages/pieces/index.vue` 更新

- 編集ボタンのリンク先を `/pieces/{id}/edit` に設定（有効化）

---

## レビュー結果

<!-- レビュー後にここに記載 -->
