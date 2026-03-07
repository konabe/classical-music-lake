# 設計: ワーク1 楽曲一覧

## バックエンド

### 型定義 (`backend/src/types/index.ts` に追記)

```typescript
export interface Piece {
  id: string;
  title: string;
  composer: string;
  createdAt: string;
  updatedAt: string;
}

export type CreatePieceInput = Omit<Piece, "id" | "createdAt" | "updatedAt">;
export type UpdatePieceInput = Partial<CreatePieceInput>;
```

### DynamoDB (`backend/src/utils/dynamodb.ts` に追記)

```typescript
export const TABLE_PIECES = process.env.DYNAMO_TABLE_PIECES ?? "classical-music-pieces";
```

### Lambda: `backend/src/pieces/list.ts`

```typescript
export const handler = createHandler(async () => {
  const result = await dynamo.send(new ScanCommand({ TableName: TABLE_PIECES }));
  const pieces = (result.Items ?? []) as Piece[];
  pieces.sort((a, b) => a.title.localeCompare(b.title, "ja"));
  return { statusCode: StatusCodes.OK, body: pieces };
});
```

### CDK (`cdk/lib/classical-music-lake-stack.ts`)

```typescript
// DynamoDB
const piecesTable = new dynamodb.Table(this, "PiecesTable", {
  tableName: "classical-music-pieces",
  partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  removalPolicy: cdk.RemovalPolicy.RETAIN,
});

// Lambda
const listPieces = fn("ListPieces", "pieces/list.ts");
piecesTable.grantReadData(listPieces);

// API Gateway
const pieces = api.root.addResource("pieces");
pieces.addMethod("GET", new apigateway.LambdaIntegration(listPieces));
```

---

## フロントエンド

### 型定義 (`types/index.ts` に追記)

```typescript
export interface Piece {
  id: string;
  title: string;
  composer: string;
  createdAt: string;
  updatedAt: string;
}
```

### ページ: `pages/pieces/index.vue`

- `GET /pieces` で楽曲一覧を取得して表示
- 各行に編集・削除ボタンを配置（後続ワークで有効化、現時点は表示のみ）
- 楽曲が 0 件の場合は空状態メッセージを表示
- 「+ 新しい楽曲」ボタンを配置（後続ワークでリンク先を実装）

---

## レビュー結果

<!-- レビュー後にここに記載 -->
