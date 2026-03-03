# コントリビューションガイド

## ブランチ戦略

- `main` ブランチへの直接 push 禁止
- 作業ブランチの命名: `feature/xxx`、`fix/xxx`、`docs/xxx`
- 必ずPRを作成してマージすること

## 開発フロー

1. `main` から作業ブランチを切る

   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

2. 実装・動作確認

3. コミット

   ```bash
   git add <ファイル>
   git commit -m "feat: 変更内容の要約"
   ```

4. PRを作成してレビュー後にマージ

## コミットメッセージ規約

[Conventional Commits](https://www.conventionalcommits.org/) に準拠する。

## PRのルール

- 実装を含むPRは `docs/SPEC.md` を同じPR内で更新すること
- PRタイトルはコミットメッセージ規約に準拠すること

## ローカル開発環境

[README.md](README.md) のセットアップ手順を参照してください。

## ディレクトリ構造・設計方針

[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) を参照してください。

## API仕様・データモデル

[docs/SPEC.md](docs/SPEC.md) を参照してください。
