# Claude Code ガイドライン

> このプロジェクトでは **Claude Code**（Anthropic 製 CLI）を AI エージェントとして使用しています。

## 基本ルール

- 日本語で応答すること
- 実装を含むPRを作成・更新したら、同じPR内で`SPEC.md`に反映すること
- DDDの設計思想を採用すること

---

## プロジェクトの目的・背景

クラシック音楽の鑑賞体験を記録・管理するWebアプリ「Classical Music Lake」。
CD・配信で聴いた演奏を記録し、作曲家・曲名・演奏家・指揮者・評価・メモを管理する個人向けサービス。

現在は視聴ログ機能のみを提供（MVP）。認証・検索・統計機能は将来フェーズで実装予定。

---

## 重要なファイルの説明

| ファイル/ディレクトリ | 役割 |
|--------------------|------|
| `docs/SPEC.md` | システム仕様書。API仕様・データモデル・インフラ構成を記載 |
| `docs/ARCHITECTURE.md` | アーキテクチャ設計書。構成図・技術選定の理由・トレードオフ |
| `docs/INCEPTION_DECK.md` | プロジェクトのビジョン・スコープ・フェーズ計画 |
| `pages/` | Nuxt ページコンポーネント（フロントエンドのルーティング） |
| `components/` | 再利用可能なUIコンポーネント |
| `composables/` | Vue Composables（API呼び出しなどの共通ロジック） |
| `types/index.ts` | フロントエンド共通の型定義 |
| `backend/src/listening-logs/` | 視聴ログ用 Lambda 関数（create/list/get/update/delete） |
| `backend/src/types/` | バックエンド共通の型定義 |
| `backend/src/utils/dynamodb.ts` | DynamoDB クライアントのラッパー |
| `cdk/lib/classical-music-lake-stack.ts` | AWSインフラ定義（CDK） |

---

## コーディング規約

- **言語**: TypeScript（フロント・バック共通）
- **フロントエンド**: Nuxt 3 / Vue 3 の Composition API を使用
- **バックエンド**: Lambda 関数は1ファイル1エンドポイント
- **型定義**: `any` の使用禁止。必ず型を定義する
- **命名**:
  - ファイル: kebab-case（例: `listening-logs.ts`）
  - 変数・関数: camelCase
  - 型・インターフェース: PascalCase
  - Vue コンポーネント: PascalCase（例: `ListeningLogForm.vue`）

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
