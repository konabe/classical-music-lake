# 設計: ワーク012-03 プログラム（楽曲マスタ連携）

## 概要

コンサート記録に演奏曲目（プログラム）を楽曲マスタから複数選択して紐付ける機能を追加する。

---

## データ構造設計

### 採用方針: `pieceIds: string[]` を ConcertLog に直接追加

`ConcertLog` に `pieceIds?: string[]` フィールドを追加する。

**採用理由:**

- 既存の `updateItem` ヘルパー（スプレッドで上書き保存）がそのまま機能する
- DynamoDB の LIST 型と JavaScript の配列が直接対応し、変換ロジックが不要
- バックエンド Lambda のビジネスロジックを変更する必要がない
- 中間テーブルの追加は個人利用規模ではオーバーエンジニアリングのため不採用

**後方互換性:** 既存のコンサート記録データには `pieceIds` が存在しないが、`undefined` として扱われるためデータ損失なし。

### 演奏順の管理

`pieceIds` 配列のインデックス順で演奏順を表現する。

- `pieceIds[0]` が1曲目、`pieceIds[1]` が2曲目
- 更新時は常に完全な配列を送信して上書き保存

`{ pieceId, order }` のオブジェクト配列は採番処理が必要になり複雑化するため不採用。

---

## API 設計

### 既存エンドポイントの拡張のみ（新規エンドポイントなし）

既存の `POST /concert-logs` および `PUT /concert-logs/{id}` のリクエスト/レスポンスに `pieceIds` を追加するだけで対応できる。CDK 変更不要。

**`pieceIds` のバリデーション:**

- 型: `string[]`（UUID 形式の文字列の配列）
- 任意項目（省略時は `undefined`）
- 空配列は許容（プログラムなしでの保存・全曲削除を許可）
- 存在しない pieceId の排除はフロントエンドの選択UIで担保（Lambda 側での存在確認は行わない）

---

## フロントエンド設計

### 楽曲情報の取得方法

詳細画面・編集画面の両方で `usePieces()` による全件取得を使う。

**採用理由:**

- バックエンド変更が不要
- `usePieces()` はフォームの楽曲選択UIと詳細表示の両方で必要なため、Nuxt の `useFetch` キャッシュが効き実質1回の取得で済む
- 楽曲数は個人利用規模（数百件以下）なのでパフォーマンス上の懸念なし

### 並べ替えUI

vuedraggable によるドラッグ&ドロップを採用する。

**採用理由:**

- 演奏順の並べ替えという操作にドラッグ&ドロップが直感的に合致する
- ユーザー指定の要件

---

## 変更ファイル一覧

### バックエンド

| ファイル                                  | 変更内容                                                                           |
| ----------------------------------------- | ---------------------------------------------------------------------------------- |
| `backend/src/types/index.ts`              | `ConcertLog` 型に `pieceIds?: string[]` を追加                                     |
| `backend/src/utils/schemas.ts`            | `createConcertLogSchema` / `updateConcertLogSchema` に `pieceIds` フィールドを追加 |
| `backend/src/concert-logs/create.test.ts` | `pieceIds` を含むテストケースを追加                                                |
| `backend/src/concert-logs/update.test.ts` | `pieceIds` の更新・全削除テストケースを追加                                        |
| `backend/src/concert-logs/get.test.ts`    | `pieceIds` を含むレスポンスのテストを追加                                          |

※ `create.ts` / `update.ts` / `get.ts` 本体のロジックは変更不要（型とスキーマの変更が自動反映される）

### フロントエンド

| ファイル                                                    | 変更内容                                                                                         |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `app/types/index.ts`                                        | `ConcertLog` / `CreateConcertLogInput` / `UpdateConcertLogInput` に `pieceIds?: string[]` を追加 |
| `app/components/organisms/ConcertLogForm.vue`               | 楽曲選択UI（usePieces + 選択リスト + vuedraggable による並び替え）を追加                         |
| `app/components/organisms/ConcertLogForm.test.ts`           | 楽曲選択・削除のテストを追加（ドラッグ操作はE2Eテストで担保）                                    |
| `app/components/organisms/ConcertLogForm.stories.ts`        | `pieceIds` を含む Story を追加                                                                   |
| `app/components/organisms/ConcertLogDetail.vue`             | プログラム（楽曲一覧）の表示セクションを追加。`pieces` prop を受け取る                           |
| `app/components/organisms/ConcertLogDetail.test.ts`         | プログラム表示・未設定時メッセージのテストを追加                                                 |
| `app/components/organisms/ConcertLogDetail.stories.ts`      | プログラムあり・なしの Story を追加                                                              |
| `app/components/templates/ConcertLogDetailTemplate.vue`     | `usePieces()` を呼び出して `ConcertLogDetail` に `pieces` を渡す                                 |
| `app/components/templates/ConcertLogDetailTemplate.test.ts` | `usePieces()` を含むテストを更新                                                                 |

### 依存関係

| ファイル       | 変更内容                                         |
| -------------- | ------------------------------------------------ |
| `package.json` | `vuedraggable` を追加（`pnpm add vuedraggable`） |

### CDK

変更なし。既存テーブル・Lambda・API Gateway のリソースをそのまま利用する。

---

## 実装順序

1. **型・スキーマ変更（基盤）**
   - `backend/src/types/index.ts`、`app/types/index.ts`、`backend/src/utils/schemas.ts` を変更
   - この変更により既存 Lambda が `pieceIds` を自動的に受け付けるようになる

2. **バックエンドテスト更新**
   - `create.test.ts` / `update.test.ts` / `get.test.ts` に `pieceIds` 関連テストを追加

3. **フォームUI（作成・編集）**
   - `ConcertLogForm.vue` に楽曲選択セクションを追加（`usePieces()` + 選択リスト + vuedraggable による並び替え）
   - 編集時の初期値（`initialValues.pieceIds`）にも対応

4. **詳細表示**
   - `ConcertLogDetail.vue` にプログラムセクションを追加
   - `ConcertLogDetailTemplate.vue` で `usePieces()` を呼び出して渡す

5. **テスト・Storybook 整備**
   - 各コンポーネントのテストと Storybook Story を追加・更新

---

## 注意事項

- `pieceIds: []`（空配列）と `pieceIds: undefined`（未送信）は区別する
  - `undefined`: 変更なし（既存の pieceIds を維持）
  - `[]`: 全曲削除（プログラムをクリア）
- `updateItem` ヘルパーの動作（空配列を DynamoDB に保存できるか）を実装前に確認すること

---

## レビュー結果

<!-- レビュー結果をここに記載してください -->
