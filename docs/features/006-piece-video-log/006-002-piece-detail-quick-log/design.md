# 楽曲詳細ページで動画を視聴しながらログを記録できる - 設計書

## 概要

楽曲一覧に詳細ページへの導線を追加し、新設する `/pieces/[id]` ページで動画視聴と視聴ログ記録をシームレスに行えるようにする。

---

## 変更対象ファイル

### 1. 楽曲一覧からの導線追加

**`app/components/molecules/PieceItem.vue`**

- 「詳細」リンクボタンを追加し、クリックで `detail` イベントを emit する
- 既存の「編集」「削除」ボタンと並べて配置する

**`app/components/organisms/PieceList.vue`**

- `PieceItem` の `@detail` イベントを受け取り、`router.push('/pieces/${piece.id}')` で遷移する

---

### 2. YouTube URL ユーティリティ

**`app/utils/video.ts`** （新規）

- `isYouTubeUrl(url: string): boolean` — URL が YouTube かどうかを判定する
  - 対象パターン: `youtube.com/watch?v=` / `youtu.be/`
- `extractYouTubeVideoId(url: string): string | null` — videoId を抽出する
- `toYouTubeEmbedUrl(url: string): string` — `/embed/{videoId}?enablejsapi=1` 形式の URL に変換する
  - `enablejsapi=1` は IFrame Player API で再生状態を取得するために必要

---

### 3. 動画プレイヤーコンポーネント

**`app/components/molecules/VideoPlayer.vue`** （新規）

- `videoUrl: string` を props として受け取る
- YouTube URL の場合:
  - `<iframe>` で `toYouTubeEmbedUrl(videoUrl)` を src に設定して埋め込む
  - YouTube IFrame Player API（`https://www.youtube.com/iframe_api`）をスクリプトとして動的ロードする
  - `YT.Player` の `onStateChange` コールバックで `YT.PlayerState.PLAYING`（値: `1`）を検知した時点で `play` イベントを emit する
  - API ロードは `onMounted` 時に行う（グローバルコールバック `window.onYouTubeIframeAPIReady` を使用）
- YouTube 以外の URL の場合:
  - 外部リンク（`<a target="_blank">`）として表示する
  - クリック時に `play` イベントを emit する
- emits: `play`

---

### 4. クイックログフォームコンポーネント

**`app/components/organisms/QuickLogForm.vue`** （新規）

- props:
  - `composer: string` — 作曲家（自動入力、表示のみ）
  - `piece: string` — 曲名（自動入力、表示のみ）
- フォーム入力項目:
  - 評価（`RatingSelector`）
  - お気に入り（チェックボックス）
  - 感想・メモ（テキストエリア）
- 鑑賞日時（`listenedAt`）と作曲家・曲名は UI に表示しない（保存時に動的に設定）
- 「記録する」ボタン押下で `submit` イベントを emit する
  - payload: `{ rating: Rating, isFavorite: boolean, memo: string }`
- emits: `submit: [values: { rating: Rating, isFavorite: boolean, memo: string }]`
- 保存完了後はフォーム入力値をリセットし、完了メッセージを表示する（ページ遷移はしない）

---

### 5. 楽曲詳細テンプレートコンポーネント

**`app/components/templates/PieceDetailTemplate.vue`** （新規）

- props:
  - `piece: Piece`
  - `error: Error | null`
- 表示内容:
  - 曲名・作曲家（常時表示）
  - `VideoPlayer`（`piece.videoUrl` がある場合のみ表示）
  - `QuickLogForm`（`piece.videoUrl` があり、かつ `VideoPlayer` から `play` イベントを受け取った後に表示）
- `VideoPlayer` の `@play` で内部状態 `hasStartedPlaying` を `true` に変更し、`QuickLogForm` を表示する
- `QuickLogForm` の `@submit` を受け取り `save` イベントを emit する
- emits: `save: [values: { rating: Rating, isFavorite: boolean, memo: string }]`

---

### 6. 楽曲詳細ページ

**`app/pages/pieces/[id]/index.vue`** （新規）

- `usePiece(() => route.params.id as string)` で楽曲データを取得する（composable は既存）
- `PieceDetailTemplate` に `piece` と `error` を渡す
- `@save` イベントを受け取り、以下の処理を行う:
  - `useListeningLogs().create()` を呼び出す
  - `listenedAt` は `new Date().toISOString()` で保存時点の日時を使用する
  - `composer`・`piece` は取得した Piece から補完する

---

## テンプレート・コンポーネントのテスト方針

新規作成するコンポーネントは `{ComponentName}.vue` / `{ComponentName}.test.ts` / `{ComponentName}.stories.ts` の3ファイルをセットで作成する。

| 対象                      | テスト種別             | 確認内容                                                             |
| ------------------------- | ---------------------- | -------------------------------------------------------------------- |
| `video.ts`                | ユニット               | YouTube URL の判定・videoId 抽出・embed URL 変換                     |
| `VideoPlayer.vue`         | フロントエンドユニット | YouTube/非YouTube での表示切り替え・外部リンククリック時の play emit |
| `QuickLogForm.vue`        | フロントエンドユニット | 入力欄表示・作曲家と曲名の表示・submit emit の内容・保存後リセット   |
| `PieceDetailTemplate.vue` | フロントエンドユニット | videoUrl 有無による表示切り替え・play 前後のフォーム表示             |
| `PieceItem.vue`           | フロントエンドユニット | 詳細ボタン表示・クリックで detail emit                               |

---

## データフロー

```
[pages/pieces/[id]/index.vue]
  → usePiece(id) で Piece を取得
  → PieceDetailTemplate (piece, error)
      → VideoPlayer (videoUrl)
          → YouTube IFrame Player API で再生状態を監視
          → 再生開始時に @play emit
      → @play 受信: hasStartedPlaying = true
      → QuickLogForm (v-if="hasStartedPlaying", composer, piece)
          → 「記録する」で @submit emit { rating, isFavorite, memo }
      → @save emit (parent へ)
  → useListeningLogs().create({ listenedAt: now, composer, piece, rating, isFavorite, memo })
```

---

## レビュー結果

<!-- レビュー後にここに記載してください -->
