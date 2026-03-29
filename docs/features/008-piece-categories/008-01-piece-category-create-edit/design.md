# 008-01 楽曲カテゴリの作成・編集対応 - 設計書

## 概要

楽曲マスタ（Piece）に4軸のカテゴリ（ジャンル・時代・編成・地域）をoptionalフィールドとして追加し、新規作成・編集フォームで設定できるようにする。

---

## 1. 型定義の変更

### 1.1 カテゴリの Union 型を追加

フロントエンド（`app/types/index.ts`）・バックエンド（`backend/src/types/index.ts`）の両方に以下の型を追加する。

| 型名             | 選択肢                                                                                  |
| ---------------- | --------------------------------------------------------------------------------------- |
| `PieceGenre`     | `"交響曲"` `"協奏曲"` `"室内楽"` `"独奏曲"` `"歌曲"` `"オペラ"` `"宗教音楽"` `"その他"` |
| `PieceEra`       | `"バロック"` `"古典派"` `"ロマン派"` `"近現代"` `"その他"`                              |
| `PieceFormation` | `"ピアノ独奏"` `"弦楽四重奏"` `"管弦楽"` `"声楽"` `"その他"`                            |
| `PieceRegion`    | `"ドイツ・オーストリア"` `"フランス"` `"ロシア"` `"イタリア"` `"その他"`                |

### 1.2 Piece インターフェースへのフィールド追加

`Piece` インターフェースに以下の optional フィールドを追加する。

| フィールド  | 型               | 必須 |
| ----------- | ---------------- | ---- |
| `genre`     | `PieceGenre`     | No   |
| `era`       | `PieceEra`       | No   |
| `formation` | `PieceFormation` | No   |
| `region`    | `PieceRegion`    | No   |

`CreatePieceInput` / `UpdatePieceInput` は `Piece` から派生しているため、自動的にこれらのフィールドを含む。

---

## 2. バックエンド変更

### 2.1 Zod バリデーションスキーマの更新

`backend/src/utils/schemas.ts` の `createPieceSchema` / `updatePieceSchema` に以下を追加する。

- 各カテゴリフィールドに `z.enum([...選択肢]).optional()` を定義
- `updatePieceSchema` では空文字列（`""`）による解除にも対応する（`z.union([z.enum([...]), z.literal("")]).optional()`）

### 2.2 Lambda 関数の変更

#### `backend/src/pieces/create.ts`

- バリデーション済みの入力からカテゴリフィールドを取り出し、DynamoDB に保存する
- 既存の保存ロジックの延長で対応可能（スキーマが通れば新フィールドも含めて保存される構造であることを確認する）

#### `backend/src/pieces/update.ts`

- 空文字列が送信されたカテゴリフィールドは、`videoUrl` と同様に属性を削除する（未設定に戻す）
- 既存のマージロジックにカテゴリフィールドを追加する

#### `backend/src/pieces/list.ts` / `get.ts` / `delete.ts`

- 変更不要（DynamoDB から取得したデータにカテゴリが含まれていればそのまま返される）

---

## 3. フロントエンド変更

### 3.1 新規 Atom コンポーネント: `SelectInput`

`app/components/atoms/` に `SelectInput.vue` を新規作成する。

- props: `modelValue`（string）、`options`（`{ value: string; label: string }[]`）、`placeholder`（string、optional）
- `<select>` 要素をラップし、未選択状態（空文字列）を先頭に表示する
- `v-model` 対応（`update:modelValue` を emit）
- テストファイル・Storybook ストーリーも作成する

### 3.2 PieceForm コンポーネントの更新

`app/components/organisms/PieceForm.vue` に4つのカテゴリ選択フィールドを追加する。

- 各カテゴリに `FormGroup` + `SelectInput` を配置する
- フォームの `reactive` 状態にカテゴリフィールドを追加する（初期値は `""`）
- `watch` の `initialValues` 反映ロジックにカテゴリフィールドを追加する
- `handleSubmit` で空文字列のカテゴリは `undefined` に変換してから emit する（APIに不要なフィールドを送らない）
- レイアウト: 動画URL の下にカテゴリ4項目を配置する
- テスト・Storybook も更新する

---

## 4. DynamoDB への影響

- DynamoDB はスキーマレスのため、テーブル定義の変更は不要
- 新しい属性はそのまま保存される
- 既存データにはカテゴリ属性が存在しないが、optional のため影響なし

---

## 5. CDK（インフラ）への影響

- 変更なし（API Gateway のルート追加なし、既存エンドポイントの拡張のみ）

---

## 6. 影響範囲まとめ

| 変更対象                    | ファイル                                        | 変更内容                                                       |
| --------------------------- | ----------------------------------------------- | -------------------------------------------------------------- |
| フロントエンド型定義        | `app/types/index.ts`                            | カテゴリ Union 型追加、Piece にフィールド追加                  |
| バックエンド型定義          | `backend/src/types/index.ts`                    | 同上                                                           |
| バリデーション              | `backend/src/utils/schemas.ts`                  | create/update スキーマにカテゴリ追加                           |
| 作成 Lambda                 | `backend/src/pieces/create.ts`                  | カテゴリ保存対応（スキーマ拡張で自動対応の可能性あり、要確認） |
| 更新 Lambda                 | `backend/src/pieces/update.ts`                  | カテゴリ更新・解除対応                                         |
| Atom コンポーネント（新規） | `app/components/atoms/SelectInput.vue`          | セレクトボックスの汎用コンポーネント                           |
| Atom テスト（新規）         | `app/components/atoms/SelectInput.test.ts`      | SelectInput のテスト                                           |
| Atom ストーリー（新規）     | `app/components/atoms/SelectInput.stories.ts`   | SelectInput の Storybook                                       |
| フォーム                    | `app/components/organisms/PieceForm.vue`        | カテゴリ選択UIの追加                                           |
| フォームテスト              | `app/components/organisms/PieceForm.test.ts`    | カテゴリ関連テストの追加                                       |
| フォームストーリー          | `app/components/organisms/PieceForm.stories.ts` | カテゴリ付きバリエーション追加                                 |
| 仕様書                      | `docs/SPEC.md`                                  | Piece 型・API仕様の更新                                        |

---

## 7. テスト方針

### バックエンド

- `create.ts` のテスト: カテゴリあり/なし/一部のみの保存を検証
- `update.ts` のテスト: カテゴリの変更・解除（空文字列送信）を検証
- スキーマテスト: 不正なカテゴリ値のバリデーションエラーを検証

### フロントエンド

- `SelectInput`: 選択肢の表示、v-model の動作、未選択状態
- `PieceForm`: カテゴリ選択UIの表示、submit時の値、初期値の反映

---

## レビュー結果

<!-- レビューアーはここに記載してください -->

| 項目                  | 結果 | コメント |
| --------------------- | ---- | -------- |
| 型定義の設計          |      |          |
| バリデーション設計    |      |          |
| Lambda 変更方針       |      |          |
| UI コンポーネント設計 |      |          |
| テスト方針            |      |          |
| 全体的な整合性        |      |          |
