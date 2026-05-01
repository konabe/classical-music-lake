# コントリビューションガイド

## ブランチ戦略

- `main` ブランチへの直接 push 禁止。必ず PR を作成してマージすること
- 作業ブランチの prefix は Conventional Commits の type と揃える:
  - `feat/xxx` - 新機能
  - `fix/xxx` - バグ修正
  - `docs/xxx` - ドキュメント
  - `refactor/xxx` - リファクタリング
  - `test/xxx` - テスト
  - `chore/xxx` - ビルド・依存関係などその他
- prod / stg / dev の自動デプロイトリガー（`main` push で stg、Release publish で prod、`dev*` タグ push で dev）は [README.md](README.md#デプロイトリガーdeployyml) を参照

## 開発フロー

1. `main` から作業ブランチを切る

   ```bash
   git checkout main
   git pull origin main
   git checkout -b feat/your-feature-name
   ```

2. 実装・動作確認

   PR を出す前に最低限以下を実行すること（pre-push フックでも自動実行されるが、事前に通しておくとフィードバックが早い）:

   ```bash
   pnpm run lint           # ESLint + Stylelint
   pnpm run format:check   # Prettier
   pnpm run test:frontend  # フロントエンドのテスト
   pnpm run test:backend   # バックエンドのテスト
   ```

   > **注意**: `pnpm test` はバックエンドのみ実行される。両方テストしたい場合は `test:frontend` と `test:backend` を個別に実行すること。

3. コミット

   ```bash
   git add <ファイル>      # `.env` 等の混入を避けるため個別指定を推奨
   git commit -m "feat: 変更内容を日本語で記述"
   ```

4. PR を作成してレビュー後にマージ

## コミットメッセージ規約

[Conventional Commits](https://www.conventionalcommits.org/) を採用しており、`commitlint`（`@commitlint/config-conventional`）と husky `commit-msg` フックで自動検証される。

### フォーマット

```text
type(scope): 日本語の説明
```

- `scope` は省略可能
- 説明（subject）は**日本語で記述**する
- subject の先頭を**英大文字にしない**（`subject-case` ルール）。ファイル名等を先頭に置く場合は日本語から始める形に言い換える
- 末尾に**ピリオド（`.`・`。`）を付けない**
- ヘッダー全体は**100 文字以内**

### type の例

`feat` / `fix` / `docs` / `refactor` / `test` / `chore` / `style` / `perf` / `build` / `ci` / `revert`

## 自動化されているチェック

ローカルで以下のフックが自動実行される。失敗すると commit / push が止まる。

| タイミング   | 実行内容                                                                                                                          |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `pre-commit` | `lint-staged`（ステージ済みファイルに ESLint / Stylelint / Prettier を `--fix` で適用）                                           |
| `commit-msg` | `commitlint`（Conventional Commits 検証）                                                                                         |
| `pre-push`   | `pnpm run format:check` + `pnpm run test:frontend` + `pnpm -C backend test`（フロント・バック両方のテストが走るので時間がかかる） |

## PR のルール

- **タイトル**は Conventional Commits の規約に準拠すること（マージ後の changelog に反映される）
- **実装を含む PR は `docs/SPEC.md` を同じ PR 内で更新する**こと（CLAUDE.md 基本ルール）
- **`CHANGELOG.md` は手動更新しない**。Release Please（`release-please-config.json`）が自動生成する
- フロント・バック両方のテストがグリーンであること
- レビュー観点:
  - DDD のレイヤー境界（`handlers/` → `usecases/` → `repositories/` → `domain/`）を守っているか（詳細は [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)）
  - 型定義の配置ルール（`shared/` の共通定数、フロント・バック分離）に沿っているか（詳細は [docs/SPEC.md](docs/SPEC.md) §8）
  - `any` 型を使っていないか（ESLint で error）

## 設計方針

このプロジェクトは **DDD（ドメイン駆動設計）** を採用している。エンティティ・値オブジェクト・レイヤー構造の詳細は以下を参照:

- ディレクトリ構造・レイヤー境界: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- ID 値オブジェクト・エンティティ基底クラス・型定義管理方針: [docs/SPEC.md](docs/SPEC.md) §8

## ローカル開発環境

[README.md](README.md) のセットアップ手順を参照してください。

## API 仕様・データモデル

[docs/SPEC.md](docs/SPEC.md) を参照してください。
