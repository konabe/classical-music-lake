# 008-02 楽曲カテゴリの表示対応 - 設計書

## 概要

楽曲一覧画面・詳細画面で、008-01 で追加したカテゴリ情報（ジャンル・時代・編成・地域）をラベル形式で表示する。カテゴリが未設定の場合は何も表示しない。

---

## 1. 新規 Atom コンポーネント: `CategoryBadge`

`app/components/atoms/CategoryBadge.vue` を新規作成する。

### Props

| プロパティ | 型       | 必須 | 説明                                        |
| ---------- | -------- | ---- | ------------------------------------------- |
| `label`    | `string` | Yes  | 軸名（例: `"ジャンル"`、`"時代"` など）     |
| `value`    | `string` | Yes  | 表示値（例: `"交響曲"`、`"ロマン派"` など） |

### 表示形式

`{label}: {value}` の形式でバッジとして表示する（例: `ジャンル: 交響曲`）。

### 設計方針

- `CategoryBadge` は常に表示する Atom とする（未設定チェックの `v-if` は呼び出し側が責任を持つ）
- スタイルは既存デザインシステムに合わせたオフホワイト系バッジ（`#f0ebe0` / `#e0d8cc`）
- テスト・Storybook も必ず作成する（コンポーネント作成の3ファイルルール）

---

## 2. `PieceItem.vue` の変更

`app/components/molecules/PieceItem.vue` を変更し、楽曲一覧の各行でカテゴリを表示する。

### 変更内容

- `.piece-main` 内の `.piece-composer` の下に `.piece-categories` セクションを追加する
- 4軸のカテゴリをそれぞれ `v-if` で表示する（未設定は非表示）

### カテゴリと表示ラベルの対応

| フィールド        | label 文字列 |
| ----------------- | ------------ |
| `piece.genre`     | `"ジャンル"` |
| `piece.era`       | `"時代"`     |
| `piece.formation` | `"編成"`     |
| `piece.region`    | `"地域"`     |

### レイアウト

`.piece-categories` は `display: flex; flex-wrap: wrap; gap: 0.3rem;` にして、複数バッジが横並びになるようにする。

---

## 3. `PieceDetailTemplate.vue` の変更

`app/components/templates/PieceDetailTemplate.vue` を変更し、楽曲詳細画面でカテゴリを表示する。

### 変更内容

- `.piece-header` 内の `.piece-composer` の下に `.piece-categories` セクションを追加する
- 4軸のカテゴリをそれぞれ `v-if` で表示する（未設定は非表示）
- `PieceItem.vue` と同じ `CategoryBadge` コンポーネントを使用する

---

## 4. 影響範囲まとめ

| 変更対象                       | ファイル                                                  | 変更内容                           |
| ------------------------------ | --------------------------------------------------------- | ---------------------------------- |
| Atom コンポーネント（新規）    | `app/components/atoms/CategoryBadge.vue`                  | カテゴリバッジの表示コンポーネント |
| Atom テスト（新規）            | `app/components/atoms/CategoryBadge.test.ts`              | CategoryBadge のユニットテスト     |
| Atom ストーリー（新規）        | `app/components/atoms/CategoryBadge.stories.ts`           | 各軸のバリエーション               |
| 楽曲一覧アイテム               | `app/components/molecules/PieceItem.vue`                  | カテゴリバッジの追加表示           |
| 楽曲一覧アイテムテスト         | `app/components/molecules/PieceItem.test.ts`              | カテゴリ表示のテスト追加           |
| 楽曲一覧アイテムストーリー     | `app/components/molecules/PieceItem.stories.ts`           | カテゴリあり/一部のバリエーション  |
| 楽曲詳細テンプレート           | `app/components/templates/PieceDetailTemplate.vue`        | カテゴリバッジの追加表示           |
| 楽曲詳細テンプレートテスト     | `app/components/templates/PieceDetailTemplate.test.ts`    | カテゴリ表示のテスト追加           |
| 楽曲詳細テンプレートストーリー | `app/components/templates/PieceDetailTemplate.stories.ts` | カテゴリあり/一部のバリエーション  |

### バックエンドへの影響

- なし（list・get Lambda は既存データをそのまま返す。カテゴリフィールドが存在すれば自動的に含まれる）

### CDK（インフラ）への影響

- なし

---

## 5. テスト方針

### `CategoryBadge`

| テストケース                              |
| ----------------------------------------- |
| label と value が表示される               |
| `label: value` の形式で結合して表示される |
| `.category-badge` クラスが存在する        |

### `PieceItem`

| テストケース                                            |
| ------------------------------------------------------- |
| genre が設定されている場合、ジャンルバッジが表示される  |
| genre が未設定の場合、ジャンルバッジが表示されない      |
| era が設定されている場合、時代バッジが表示される        |
| era が未設定の場合、時代バッジが表示されない            |
| 4軸すべて設定されている場合、すべてのバッジが表示される |
| 全カテゴリが未設定の場合、バッジが一切表示されない      |

### `PieceDetailTemplate`

| テストケース                                           |
| ------------------------------------------------------ |
| genre が設定されている場合、ジャンルバッジが表示される |
| genre が未設定の場合、ジャンルバッジが表示されない     |
| 全カテゴリが未設定の場合、バッジが一切表示されない     |

---

## 6. 実装順序

1. `CategoryBadge.vue` + テスト + ストーリーを作成し、Atom 単体で動作確認する
2. `PieceItem.vue` に `CategoryBadge` を組み込む。テスト・ストーリーを更新する
3. `PieceDetailTemplate.vue` に `CategoryBadge` を組み込む。テスト・ストーリーを更新する
4. `npm run test:frontend` で全テストが通ることを確認する

---

## レビュー結果

<!-- レビューアーはここに記載してください -->

| 項目                       | 結果 | コメント |
| -------------------------- | ---- | -------- |
| CategoryBadge の設計       |      |          |
| PieceItem への組み込み方針 |      |          |
| PieceDetailTemplate の方針 |      |          |
| テスト方針                 |      |          |
| 全体的な整合性             |      |          |
