---
name: merge-dependabot
description: Dependabotが作成したオープン中のPRを一括確認し、CIが通っているものをマージする。breaking changesのリスク調査も行う。
disable-model-invocation: true
allowed-tools: Bash(gh pr list *) Bash(gh pr view *) Bash(gh pr merge *) Bash(gh pr review *) Bash(gh pr comment *) Bash(git checkout *) Bash(git fetch *) Bash(git rebase *) Bash(git add *) Bash(git commit *) Bash(git push *) Bash(git status *) Bash(git log *) Bash(pnpm install *) Bash(mkdir *) Write
---

# Dependabot PR の自動マージ

Dependabot が作成したオープン中の PR を一括確認し、CI が通っているものをマージする。

## このリポジトリ固有の前提知識

- **pnpm workspace 構成**: ルートの `pnpm-lock.yaml` が全サブパッケージ（`/backend`, `/cdk` など）を管理する
- **Dependabot の制限**: サブディレクトリ（`/backend`, `/cdk`）対象の PR はサブパッケージの `package.json` のみ更新し、ルートの `pnpm-lock.yaml` を更新しない
- **CI の挙動**: `pnpm install --frozen-lockfile` を使うため、`pnpm-lock.yaml` が古いと `ERR_PNPM_OUTDATED_LOCKFILE` で CI 失敗する
- **ブランチ保護**: 自動マージ（`--auto`）は無効。`gh pr review --approve` してから `gh pr merge --squash --delete-branch --admin` でマージする（`--admin` は "up to date" 要件を回避するため）

## 手順

### 1. Dependabot PR の一覧取得

```bash
gh pr list --author app/dependabot --state open --json number,title,headRefName,statusCheckRollup
```

PR がなければ「マージ対象の Dependabot PR はありません」と報告して終了する。

### 2. 各 PR のステータス確認とバージョンアップ影響度調査

各 PR について以下を並列で確認する：

```bash
gh pr view <number> --json number,title,mergeable,statusCheckRollup,headRefName,body
```

**ステータス判定**：
- 全チェックが `SUCCESS` または `NEUTRAL`/`SKIPPED` → CI 通過
- `FAILURE` のチェックがある → CI 失敗。**原因を確認する**：
  - チェック名が `Lint & Format` / `Frontend (Vitest)` / `Backend (Vitest)` の場合 → lockfile 起因の可能性が高い（手順3へ）
  - その他の失敗 → スキップ理由を記録

**Breaking Changes 調査**（CI 通過 PR のみ）：
- パッチ更新（`x.y.Z`）→ breaking changes なし、調査不要
- マイナー更新（`x.Y.z`）→ PR body の changelog を確認。通常は breaking changes なし
- メジャー更新（`X.y.z`）→ `general-purpose` エージェントで公式 changelog を WebSearch/WebFetch 調査する
- `devDependencies` はリスク低、`dependencies` はより慎重に

確認結果を `tmp/dependabot-status.md` に以下の表形式で出力する（ファイルがなければ作成、あれば上書き）：

```markdown
# Dependabot PR ステータス確認

実行日時: YYYY-MM-DD HH:mm

| PR番号 | タイトル | 最終判定 |
|--------|----------|---------|
| #123   | bump foo from 1.0 to 2.0 | ✅ マージOK |
| #124   | bump bar from 3.0 to 3.1 | ⏳ スキップ（CI実行中）|
| #125   | bump baz from 2.0 to 3.0 | 🔧 lockfile修正待ち |
| #126   | bump qux from 2.0 to 3.0 | ⚠️ 要検証 |
```

判定列の値：
- `✅ マージOK`：CI 通過かつ breaking changes なし
- `🔧 lockfile修正待ち`：lockfile 起因の CI 失敗（手順3で自動修正する）
- `⚠️ 要検証`：breaking changes あり、影響度不明
- `⏳ スキップ（CI実行中）`：チェックが PENDING
- `❌ スキップ（CI失敗）`：lockfile 以外の原因で CI 失敗
- `❌ スキップ（コンフリクト）`：mergeable でない
- `❌ マージ保留`：重大な breaking changes またはセキュリティ関連で詳細不明

### 3. lockfile 起因の CI 失敗 PR を一括修正

`🔧 lockfile修正待ち` と判定した PR について、**worktree 内で**以下の手順を各 PR ごとに実行する：

```bash
# ブランチを取得してチェックアウト
git fetch origin <headRefName>
git checkout <headRefName>

# ルートの pnpm-lock.yaml を更新
pnpm install --no-frozen-lockfile

# lockfile のみコミット（package.json は変更しない）
git add pnpm-lock.yaml
git commit -m "chore: pnpm-lock.yaml を更新（<パッケージ名> <バージョン>）"

# Dependabot ブランチへ push
git push origin HEAD:<headRefName>
```

push 後は CI が自動で再実行される。CI 完了を**待たずに**次の PR の lockfile 修正へ進む（並列で CI が走る）。

全 PR の push が終わったら、CI 完了を待ってから手順4へ進む。

> **注意**: 各ブランチのチェックアウト前に `git checkout -- .` でワーキングツリーをクリーンにすること。

### 4. マージ実行

`✅ マージOK` の PR（最初から CI 通過のもの＋lockfile 修正後に CI が通ったもの）を順番にマージする：

```bash
# まず approve（未 approve の場合）
gh pr review <number> --approve

# squash merge（--admin でブランチ保護の "up to date" 要件を回避）
gh pr merge <number> --squash --delete-branch --admin
```

マージ後、結果（成功 or エラー）を記録する。

### 5. 結果サマリーの報告

全 PR の処理が完了したら以下の形式で報告する：

```markdown
## Dependabot PR マージ結果

### マージ済み
- #<番号> <タイトル>（<パッケージ> <バージョン>）

### lockfile 修正してマージ
- #<番号> <タイトル>：pnpm-lock.yaml を更新してマージ

### スキップ（CI 失敗）
- #<番号> <タイトル>：<lockfile 以外の失敗原因>

### スキップ（CI 実行中）
- #<番号> <タイトル>：チェック実行中

### 要検証（Breaking Changes / 影響度不明）
- #<番号> <タイトル>：<調査内容と判定理由>
```

マージ保留となった PR については、`tmp/` 配下に調査ノートを作成し、後日対応時の参考資料として残す。
