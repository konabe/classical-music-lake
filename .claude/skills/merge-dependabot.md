---
name: merge-dependabot
description: Dependabotが作成したオープン中のPRを一括確認し、CIが通っているものをマージする。breaking changesのリスク調査も行う。
disable-model-invocation: true
allowed-tools: Bash(gh pr list *) Bash(gh pr view *) Bash(gh pr merge *) Bash(mkdir *) Write
---

# Dependabot PR の自動マージ

Dependabot が作成したオープン中の PR を一括確認し、CI が通っているものをマージする。

## 手順

1. **Dependabot PR の一覧取得**

   ```bash
   gh pr list --author app/dependabot --state open --json number,title,headRefName,statusCheckRollup
   ```

   PR がなければ「マージ対象の Dependabot PR はありません」と報告して終了する。

2. **各 PR のステータス確認**

   各 PR について以下を確認する：

   ```bash
   gh pr view <number> --json number,title,mergeable,statusCheckRollup,reviews
   ```

   - `mergeable` が `MERGEABLE` であること
   - `statusCheckRollup` の全チェックが `SUCCESS` または `NEUTRAL` であること
   - いずれかが失敗・保留中の場合はその PR をスキップし、スキップ理由を記録する

   確認結果を `tmp/dependabot-status.md` に以下の表形式で出力する（ファイルがなければ作成、あれば上書き）：

   ```markdown
   # Dependabot PR ステータス確認

   実行日時: YYYY-MM-DD HH:mm

   | PR番号 | タイトル | 最終判定 |
   |--------|----------|---------|
   | #123   | bump foo from 1.0 to 2.0 | ✅ マージOK |
   | #124   | bump bar from 3.0 to 3.1 | ⏳ スキップ（CI実行中）|
   | #125   | bump baz from 2.0 to 3.0 | ❌ スキップ（コンフリクト）|
   | #126   | bump qux from 2.0 to 3.0 | ⚠️ 要検証 |
   ```

   判定列の値：
   - `✅ マージOK`：mergeable かつ全チェック SUCCESS/NEUTRAL かつ breaking changes なし
   - `⚠️ 要検証`：breaking changes あり、または影響度が不明
   - `⏳ スキップ（CI実行中）`：チェックが PENDING
   - `❌ スキップ（CI失敗）`：チェックが FAILURE
   - `❌ スキップ（コンフリクト）`：mergeable でない
   - `❌ マージ保留`：重大な breaking changes またはセキュリティ関連で詳細不明

3. **バージョンアップの影響度調査**

   CI が通っているものについて、マージ前に以下を調査し「マージしていいか」を判定する：
   - **パッケージの変更内容を確認**：

     ```bash
     gh pr view <number> --json body
     ```

     - PR の説明や `.md` ファイルの内容を確認（CHANGELOG、upgrade guide など）

   - **Breaking Changes の確認**：
     - メジャーバージョンアップの場合は特に注意（e.g., `3.x.x` → `4.0.0`）
     - `@angular`, `eslint`, `typescript` などの主要ツールの breaking changes は `general-purpose` エージェントを使って WebSearch/WebFetch で公式 changelog を調査する
     - 調査はメインのコンテキストを汚染しないようにサブエージェントに委譲すること

   - **影響範囲の評価**：
     - `dependencies` vs `devDependencies` の区別
     - `dependencies` の場合：実行時の動作に影響 → より慎重に判定
     - `devDependencies` の場合：ビルド・テストのみに影響 → リスクが低い

   - **判定基準**：
     - ✅ マージOK：breaking changes なし、またはリリースノートで明確に対応方法が記載されている
     - ⚠️ 要検証：breaking changes あり、影響度が不明 → `tmp/` に検証結果をメモし、手動テストを実施
     - ❌ マージ保留：重大な breaking changes、またはセキュリティ関連で詳細が不明

   調査完了後、`tmp/dependabot-status.md` の該当行の「最終判定」列を更新して上書き保存する。

4. **マージ実行**

   マージ可能な PR を順番にマージする：

   ```bash
   gh pr merge <number> --squash --auto --delete-branch
   ```

   マージ後、結果（成功 or エラー）を記録する。

5. **結果サマリーの報告**

   全 PR の処理が完了したら以下の形式で報告する：

   ```
   ## Dependabot PR マージ結果

   ### マージ済み
   - #<番号> <タイトル>（<パッケージ> <バージョン>）

   ### スキップ（CI 失敗 / コンフリクト）
   - #<番号> <タイトル>：<理由>

   ### スキップ（CI 実行中）
   - #<番号> <タイトル>：チェック実行中

   ### 要検証（Breaking Changes / 影響度不明）
   - #<番号> <タイトル>：<調査内容と判定理由>
   ```

   マージ保留となった PR については、`tmp/` 配下に調査ノートを作成し、後日対応時の参考資料として残す。
