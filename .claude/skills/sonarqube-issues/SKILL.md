---
name: sonarqube-issues
description: SonarQube CloudからIssueを取得して一覧表示する。コード品質の確認やIssue対応時に使う。
disable-model-invocation: true
allowed-tools: WebFetch
argument-hint: "[severities|types|statuses] (例: severities:CRITICAL,MAJOR types:BUG)"
---

# SonarQube Cloud Issue 取得

SonarQube Cloud の API を使って、プロジェクトの Issue を取得・分析する。

## プロジェクト情報

- **プロジェクトキー**: `konabe_classical-music-lake`
- **API ベース URL**: `https://sonarcloud.io/api/issues/search`
- **認証**: 不要（公開プロジェクト）

## 手順

### 1. Issue サマリーの取得

まず、ファセット付きでサマリー情報を取得する：

```text
https://sonarcloud.io/api/issues/search?projects=konabe_classical-music-lake&ps=1&facets=severities,types,statuses
```

WebFetch で上記 URL を呼び出し、以下の情報を抽出する：

- Issue 総数（`paging.total`）
- 深刻度別の件数（`facets` の `severities`）: BLOCKER, CRITICAL, MAJOR, MINOR, INFO
- 種別の件数（`facets` の `types`）: BUG, VULNERABILITY, CODE_SMELL
- ステータス別の件数（`facets` の `statuses`）: OPEN, CONFIRMED, REOPENED, RESOLVED, CLOSED

### 2. サマリーの表示

以下のフォーマットで表示する：

```markdown
## SonarQube Issue サマリー

**総数**: N 件

### 深刻度別
| 深刻度 | 件数 |
|--------|------|
| BLOCKER | N |
| CRITICAL | N |
| MAJOR | N |
| MINOR | N |
| INFO | N |

### 種別
| 種別 | 件数 |
|------|------|
| BUG | N |
| VULNERABILITY | N |
| CODE_SMELL | N |

### ステータス別
| ステータス | 件数 |
|------------|------|
| OPEN | N |
| CONFIRMED | N |
| ... | ... |
```

### 3. 詳細 Issue 一覧の取得

サマリー表示後、フィルタに応じた Issue 一覧を取得する。

#### URL の組み立て

ベース URL に以下のパラメータを付与する：

- `projects=konabe_classical-music-lake`（固定）
- `ps=100`（1ページあたりの取得件数）
- `p=1`（ページ番号）
- `statuses=OPEN,CONFIRMED,REOPENED`（デフォルト: オープンな Issue のみ）

引数 `$ARGUMENTS` が指定されている場合、以下のフィルタを追加する：

| 引数形式 | API パラメータ | 値の例 |
|----------|---------------|--------|
| `severities:値` | `severities` | `BLOCKER`, `CRITICAL,MAJOR` |
| `types:値` | `types` | `BUG`, `CODE_SMELL`, `VULNERABILITY` |
| `statuses:値` | `statuses` | `OPEN`, `CONFIRMED,REOPENED` |

例：
- 引数なし → `?projects=konabe_classical-music-lake&ps=100&statuses=OPEN,CONFIRMED,REOPENED`
- `severities:CRITICAL,MAJOR` → `?projects=konabe_classical-music-lake&ps=100&statuses=OPEN,CONFIRMED,REOPENED&severities=CRITICAL,MAJOR`
- `types:BUG severities:BLOCKER` → `?projects=konabe_classical-music-lake&ps=100&statuses=OPEN,CONFIRMED,REOPENED&types=BUG&severities=BLOCKER`
- `statuses:OPEN` → `?projects=konabe_classical-music-lake&ps=100&statuses=OPEN`

#### WebFetch の呼び出し

組み立てた URL を WebFetch で呼び出し、レスポンスの JSON から以下を抽出するよう prompt に指示する：

- 各 Issue の `message`（Issue の説明）
- 各 Issue の `component`（ファイルパス。プロジェクトキーのプレフィックスを除去する）
- 各 Issue の `line`（行番号）
- 各 Issue の `severity`（深刻度）
- 各 Issue の `type`（種別）
- 各 Issue の `rule`（ルール名）
- 各 Issue の `effort`（修正工数の目安）
- ページング情報（`paging.total`, `paging.pageIndex`, `paging.pageSize`）

### 4. 詳細 Issue 一覧の表示

以下のフォーマットで表示する：

```markdown
## Issue 一覧（N 件中 1-100 件）

| # | 深刻度 | 種別 | ファイル | 行 | メッセージ | ルール | 工数 |
|---|--------|------|----------|-----|-----------|--------|------|
| 1 | MAJOR | CODE_SMELL | composables/useAuth.ts | 42 | ... | typescript:S1234 | 5min |
| 2 | MINOR | CODE_SMELL | pages/index.vue | 10 | ... | typescript:S5678 | 2min |
```

100件を超える場合は、最初の100件のみ表示し「残り N 件あります。`/sonarqube-issues` で追加フィルタを指定して絞り込んでください」と案内する。

## 注意事項

- WebFetch の prompt には「JSON レスポンスから指定フィールドをすべて抽出して、省略せずに返すこと」と明記する
- Issue が 0 件の場合は「該当する Issue はありません」と報告する
- API エラー時はステータスコードとメッセージを表示する
