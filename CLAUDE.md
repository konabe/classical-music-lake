# Claude Code ガイドライン

> このプロジェクトでは **Claude Code**（Anthropic 製 CLI）を AI エージェントとして使用しています。

## 基本ルール

- 日本語で応答すること
- 実装を含むPRを作成・更新したら、同じPR内で`SPEC.md`に反映すること
- DDDの設計思想を採用すること
- `cd` を先頭に付けてコマンドを生成しないこと
- コマンドを連結しないこと（`&&` を使用しない）

---

## プロジェクトの目的・背景

クラシック音楽の鑑賞体験を記録・管理するWebアプリ「Classical Music Lake」。
CD・配信で聴いた演奏を記録し、作曲家・曲名・演奏家・指揮者・評価・メモを管理する個人向けサービス。

現在は視聴ログ機能・曲マスタ管理・ユーザー認証（Cognito）・メール認証・ヘッダーナビゲーションを実装済み。検索・統計機能は将来フェーズで実装予定。

---

## 重要なファイルの説明

| ファイル/ディレクトリ                   | 役割                                                       |
| --------------------------------------- | ---------------------------------------------------------- |
| `docs/SPEC.md`                          | システム仕様書。API仕様・データモデル・インフラ構成を記載  |
| `docs/ARCHITECTURE.md`                  | アーキテクチャ設計書。構成図・技術選定の理由・トレードオフ |
| `docs/INCEPTION_DECK.md`                | プロジェクトのビジョン・スコープ・フェーズ計画             |
| `pages/`                                | Nuxt ページコンポーネント（フロントエンドのルーティング）  |
| `components/`                           | 再利用可能なUIコンポーネント                               |
| `composables/`                          | Vue Composables（API呼び出しなどの共通ロジック）           |
| `types/index.ts`                        | フロントエンド共通の型定義                                 |
| `backend/src/listening-logs/`           | 視聴ログ用 Lambda 関数（create/list/get/update/delete）    |
| `backend/src/types/`                    | バックエンド共通の型定義                                   |
| `backend/src/utils/dynamodb.ts`         | DynamoDB クライアントのラッパー                            |
| `cdk/lib/classical-music-lake-stack.ts` | AWSインフラ定義（CDK）                                     |

---

## コーディング規約

命名規則・フォーマット・インポート順序は ESLint（[eslint.config.mjs](eslint.config.mjs)）と Prettier（[.prettierrc](.prettierrc)）で自動的に強制される。

### 共通

- **言語**: TypeScript（フロント・バック共通）
- **型定義**: `any` 禁止（ESLint で error）
- **コメント**: 自明なロジックへのコメント不要。複雑な処理のみ記述

### フロントエンド（Nuxt 3 / Vue 3）

- Composition API（`<script setup>`）を使用
- `composables/` に API 呼び出しロジックをまとめる

### バックエンド（Lambda）

- 1ファイル1エンドポイント（`backend/src/{機能名}/{操作}.ts`）
- レスポンスは `utils/response.ts` のヘルパーを使用
- エラーは必ず `try/catch` で捕捉し `internalError()` を返す

### TypeScript

- strict モードを前提とした型付け
- `interface` より `type` を優先（ただし拡張が必要な場合は `interface`）

---

## テストコマンド

| 対象               | コマンド                |
| ------------------ | ----------------------- |
| バックエンドのみ   | `npm run test:backend`  |
| フロントエンドのみ | `npm run test:frontend` |

> **注意**: `npm test` はバックエンドのみ実行される。両方テストしたい場合は各コマンドを個別に実行すること。

---

## よくある操作パターン

### フロントエンドのAPI呼び出し

`composables/` に API 呼び出しロジックをまとめる。

### バックエンドの Lambda 関数追加

1. `backend/src/{機能名}/` にファイルを作成
2. `cdk/lib/classical-music-lake-stack.ts` に Lambda・API Gateway ルートを追加
3. `docs/SPEC.md` に API 仕様を追記

### 新しい型の追加

- フロントエンドの型: `types/index.ts`
- バックエンドの型: `backend/src/types/index.ts`
- 両方に同じ型が必要な場合は重複を許容（パッケージを分離しているため）

---

## 禁止事項・注意事項

- `main` ブランチへの直接 push 禁止。必ずPRを作成すること
- `any` 型の使用禁止
- APIの認証なし状態のまま本番で個人情報を扱わないこと
- DynamoDB の削除ポリシー（`ListeningLogs` テーブルは `RETAIN`）を変更しないこと
- 環境変数（`.env`）をコミットしないこと
