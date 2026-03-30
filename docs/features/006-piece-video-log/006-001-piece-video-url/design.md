# 楽曲マスタに動画URLを登録・編集できる - 設計書

## 概要

楽曲マスタ（Piece）に `videoUrl` フィールドを追加し、新規作成・編集フォームから登録・更新できるようにする。
DynamoDB はスキーマレスなため既存データへのマイグレーションは不要。

---

## 変更対象ファイル

### 1. 型定義（フロント・バック両方を同期）

**`app/types/index.ts`** / **`backend/src/types/index.ts`**

`Piece` インターフェースに任意フィールド `videoUrl` を追加する。

```text
Piece {
  id: string
  title: string
  composer: string
  videoUrl?: string   // 追加（任意項目）
  createdAt: string
  updatedAt: string
}
```

`CreatePieceInput` / `UpdatePieceInput` は `Piece` からの `Omit` / `Partial` で定義されているため、自動的に `videoUrl` を含む型になる。

---

### 2. バックエンド：バリデーションスキーマ

**`backend/src/utils/schemas.ts`**

`createPieceSchema` と `updatePieceSchema` に `videoUrl` フィールドを追加する。

- 任意項目（`optional()`）
- 値がある場合は URL フォーマットの検証を行う（`z.string().url()`）
- 空文字での送信（URL の削除操作）も許容する
  - `z.union([z.string().url(), z.literal("")]). optional()` に近い形
- ドメイン制限は行わない（YouTube 限定にしない）

---

### 3. バックエンド：Lambda 関数

**`backend/src/pieces/create.ts`** / **`backend/src/pieces/update.ts`**

`input` を `...input` でスプレッドして DynamoDB に書き込む実装のため、スキーマ変更のみで対応可能。
コードの修正は不要。

---

### 4. フロントエンド：PieceForm コンポーネント

**`app/components/organisms/PieceForm.vue`**

- `videoUrl` を `form` のリアクティブオブジェクトに追加（初期値は空文字 `""`）
- `initialValues` の `watch` に `videoUrl` の初期化処理を追加
- テンプレートに `videoUrl` 用の `FormGroup` + `TextInput` を追加
  - ラベル: `動画URL`
  - 必須でない（`RequiredMark` 不要）
  - `placeholder` 例: `https://www.youtube.com/watch?v=...`
- `handleSubmit` の `emit` 時に `videoUrl` を含む形に変更
  - 空文字を送信するか `undefined` にするかの制御が必要
  - 要件「動画 URL を削除（空文字）して保存できる」に対応するため、編集時は空文字をそのまま送る

---

### 5. フロントエンド：テスト・Storybook

**`app/components/organisms/PieceForm.test.ts`**

以下のケースを追加・更新する：

- `videoUrl` 入力欄が表示されること
- `videoUrl` を入力せずに submit できること
- `videoUrl` に値を入れて submit するとその値が `emit` されること
- `initialValues` に `videoUrl` がある場合、フォームに初期値が入ること
- `videoUrl` を空文字にして submit できること

**`app/components/organisms/PieceForm.stories.ts`**

- `videoUrl` 入力済みのストーリーを追加する

---

## バリデーション詳細

| フィールド | 必須 | 制約                                 | 空文字の扱い           |
| ---------- | :--: | ------------------------------------ | ---------------------- |
| `videoUrl` |  -   | URL フォーマット（ドメイン制限なし） | 許容（フィールド削除） |

---

## データフロー

```text
[PieceForm]
  → videoUrl を含む CreatePieceInput / UpdatePieceInput を emit
  → [PieceNewTemplate / PieceEditTemplate]
  → usePieces().createPiece / updatePiece
  → POST/PUT /pieces (API Gateway)
  → Lambda (create.ts / update.ts)
  → DynamoDB (Pieces テーブル)
```

---

## 既存データへの影響

- DynamoDB はスキーマレスのため、既存の Piece アイテムは `videoUrl` フィールドなしのまま保存されている
- `videoUrl` が存在しない場合は `undefined` として扱われ、任意フィールドのため型上も問題ない
- マイグレーション不要

---

## テスト方針

| 対象                | テスト種別             | 確認内容                                                   |
| ------------------- | ---------------------- | ---------------------------------------------------------- |
| `createPieceSchema` | バックエンドユニット   | videoUrl あり・なし・不正 URL それぞれのバリデーション結果 |
| `updatePieceSchema` | バックエンドユニット   | 同上、加えて空文字での削除                                 |
| `create.ts` Lambda  | バックエンドユニット   | videoUrl が DynamoDB に書き込まれること                    |
| `update.ts` Lambda  | バックエンドユニット   | videoUrl の追加・更新・削除が反映されること                |
| `PieceForm.vue`     | フロントエンドユニット | 表示・入力・emit 内容の検証                                |

---

## レビュー結果

<!-- レビュー後にここに記載してください -->
