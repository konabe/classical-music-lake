# 設計: ワーク2 楽曲登録

## バックエンド

### Lambda: `backend/src/pieces/create.ts`

```typescript
export const handler = createHandler(async (event) => {
  if (!event.body) throw new createError.BadRequest("Request body is required");

  let input: CreatePieceInput;
  try {
    const parsed: unknown = JSON.parse(event.body);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new createError.BadRequest("Request body must be a JSON object");
    }
    input = parsed as CreatePieceInput;
  } catch (err) {
    if (isHttpError(err)) throw err;
    throw new createError.BadRequest("Invalid JSON");
  }

  if (!input.title) throw new createError.BadRequest("title is required");
  if (!input.composer) throw new createError.BadRequest("composer is required");

  const now = new Date().toISOString();
  const item: Piece = {
    ...input,
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  await dynamo.send(new PutCommand({ TableName: TABLE_PIECES, Item: item }));
  return { statusCode: StatusCodes.CREATED, body: item };
});
```

### CDK

```typescript
const createPiece = fn("CreatePiece", "pieces/create.ts");
piecesTable.grantWriteData(createPiece);
pieces.addMethod("POST", new apigateway.LambdaIntegration(createPiece));
```

---

## フロントエンド

### ページ: `pages/pieces/new.vue`

- 曲名・作曲家の入力フォーム（既存の `ListeningLogForm` とは独立したシンプルなフォーム）
- `POST /pieces` を呼び出し、成功後に `/pieces` へリダイレクト
- バリデーションエラー時はエラーメッセージを表示

---

## レビュー結果

<!-- レビュー後にここに記載 -->
