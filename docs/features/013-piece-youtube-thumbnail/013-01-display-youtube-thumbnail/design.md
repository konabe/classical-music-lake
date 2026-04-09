# ワーク013-01 設計書: 楽曲一覧に YouTube サムネイルを表示する

## 1. 全体方針

楽曲一覧の各行に YouTube サムネイル画像を表示する機能を、**純粋な表示 Atom を新規追加して既存の `PieceItem.vue` から利用する**方式で実現する。

- 遷移ロジックや YouTube 判定ロジックを Molecule に漏らさず、Atom 内部に閉じ込めて再利用性・テスト容易性を確保する
- 既存の `PieceItem` → 親コンポーネントへの `detail` emit パターンを踏襲し、サムネイルクリックもこのイベントに集約する（遷移経路を1系統に統一）
- 既存の `app/utils/video.ts`（`isYouTubeUrl` / `extractYouTubeVideoId`）を再利用する

---

## 2. 影響範囲

### 新規作成

| ファイル                                           | 種別                    |
| -------------------------------------------------- | ----------------------- |
| `app/components/atoms/YouTubeThumbnail.vue`        | Atom コンポーネント本体 |
| `app/components/atoms/YouTubeThumbnail.test.ts`    | ユニットテスト          |
| `app/components/atoms/YouTubeThumbnail.stories.ts` | Storybook ストーリー    |

### 修正

| ファイル                                        | 修正内容                                                                         |
| ----------------------------------------------- | -------------------------------------------------------------------------------- |
| `app/components/molecules/PieceItem.vue`        | サムネイル領域を左側に配置、クリックで `detail` emit、レスポンシブ時の並び順調整 |
| `app/components/molecules/PieceItem.test.ts`    | サムネイル表示有無のケース追加・クリック時の emit 検証追加                       |
| `app/components/molecules/PieceItem.stories.ts` | サムネイルあり/なしのストーリーを追加                                            |

### 変更しない

- `app/components/organisms/PieceList.vue` — `PieceItem` の props/emit 契約は変えないため変更不要
- `app/pages/pieces/index.vue` — 同上
- `app/utils/video.ts` — 既存関数をそのまま利用
- `shared/constants.ts` / `app/types/index.ts` — 型の変更なし（`Piece.videoUrl` は既に定義済み）

---

## 3. コンポーネント設計

### 3.1 YouTubeThumbnail（新規 Atom）

**責務**: 動画 URL を受け取り、それが YouTube URL の場合に限り YouTube 公式サムネイル画像を表示する。表示ロジックのみを持ち、遷移・クリック処理は持たない。

#### Props

| 名前       | 型                    | 必須 | 説明                                                                  |
| ---------- | --------------------- | ---- | --------------------------------------------------------------------- |
| `videoUrl` | `string \| undefined` | ✅   | 動画 URL。YouTube URL でない、または undefined の場合は何も描画しない |
| `alt`      | `string`              | ✅   | 画像の代替テキスト（例: 楽曲名を含めた「{曲名} の動画サムネイル」）   |

#### 内部ロジック

1. `isYouTubeUrl(videoUrl)` で YouTube URL かどうかを判定
2. YouTube URL の場合、`extractYouTubeVideoId(videoUrl)` で videoId を抽出
3. `https://img.youtube.com/vi/{videoId}/mqdefault.jpg` を `src` に指定した `<img>` 要素を描画
4. 画像のロードエラー（404 等）を `@error` で検知し、リアクティブなエラー状態で要素ごと非表示にする
5. `videoUrl` が YouTube URL でない / undefined / videoId 抽出失敗 / ロードエラーのいずれかの場合は、`v-if` によって何もレンダリングしない（コンポーネント自身が空になる）

#### 画像属性

- **サムネイル画質**: `mqdefault.jpg`（320×180, 16:9 クロップ）を既定とする
  - `default.jpg`（120×90, 4:3）/ `hqdefault.jpg`（480×360, 4:3）/ `sddefault.jpg`（640×480, 4:3）は上下黒帯が入るため一覧表示に不向き
  - `maxresdefault.jpg`（1280×720）は転送量が大きく、一部動画で存在せず 404 になるため NG
- **Retina 対応**: `srcset` に `hqdefault.jpg` を 2x として追加する（`hqdefault.jpg` は 4:3 だがブラウザは `width`/`height` でクロップ描画するため一覧表示では問題ない）
  - ※ この項目は実装時に画質検証した上で不要と判断すれば省略可
- **パフォーマンス**: `loading="lazy"`, `decoding="async"` を付与して初期スクロール時の帯域消費を抑制
- **CLS 対策**: `width` / `height` 属性を明示し、ブラウザが事前にアスペクト比を予約できるようにする
- **alt**: props で受け取った値をそのまま設定（PieceItem 側で曲名を含めた文字列を渡す）

#### スタイル

- 幅は約 160px（PC 時）、アスペクト比 16:9
- `object-fit: cover` で崩れ防止
- `border-radius: 6px` 程度で既存 UI のトーンに合わせる

### 3.2 PieceItem（修正）

#### レイアウト変更

- 既存の `.piece-main`（title / composer / カテゴリ）の **前に** サムネイル領域を追加
- サムネイル領域は `YouTubeThumbnail` を内包する `<button type="button">` 要素（クリックで `emit('detail')`）
- サムネイルがない行（YouTubeThumbnail が `v-if` で空になる行）は `<button>` 自体を描画しない条件分岐を持つか、サムネイル領域そのものが空でスペースを取らないようにする
  - 推奨: `PieceItem` 側で `isYouTubeUrl(piece.videoUrl)` を直接参照してサムネイル領域の `<button>` 自体を `v-if` で出し分ける。`YouTubeThumbnail` 内部にも判定があるため二重判定になるが、Molecule 側でサムネイル有無を知ることでレイアウトを制御しやすくなる
- 右側の「詳細 / 編集 / 削除」ボタン群は既存のまま

#### クリックハンドリング

- サムネイルを包む `<button>` の `@click` で既存の `emit('detail')` を発火
- 既存の「詳細」ボタンと同じ emit を流用することで、親の `PieceList.vue` のハンドリングは一切変更不要
- `<button>` に `aria-label="{曲名} の詳細を開く"` を設定してスクリーンリーダー対応
- ※ middle-click（新規タブで開く）対応は今回のスコープ外。必要になった時点で `NuxtLink` ベースへ移行を検討

#### レスポンシブ対応

- 既存の `@media (max-width: 600px)` で `flex-direction: column` に切り替わる構造を維持
- 縦積み時のサムネイル位置は **最上段に配置**（CSS の `order` 指定でサムネイル領域を一番上に）
- 理由: タイトルと横並びにするとカテゴリバッジ含むメイン情報の可読幅が狭まりすぎる。非表示にするとスマホで動画ありを視覚認識できる利点を損なう
- スマホ時のサムネイル幅は最大 240px 程度（`max-width` で制約）

#### 高さの整合性

- サムネイル無し行とあり行の高さ差を軽減するため、`.piece-main` に `min-height` を 90px 程度付与
- `align-items: center` を維持することで、サムネイル無し行でもメイン情報が縦中央に収まる

---

## 4. データフロー

```text
pages/pieces/index.vue
  └─ PiecesTemplate
       └─ PieceList
            └─ PieceItem (piece prop)
                 ├─ YouTubeThumbnail (videoUrl, alt)
                 │    └─ <img src="https://img.youtube.com/vi/{videoId}/mqdefault.jpg" />
                 │         └─ @error → 内部エラー状態 → v-if で非表示
                 └─ <button @click="emit('detail')">（サムネイル領域）
                        ↓
                   親 (PieceList → pages/pieces/index.vue)
                        ↓
                   router.push(`/pieces/${piece.id}`)
```

---

## 5. 表示パターン（視覚的整理）

| ケース                                        | サムネイル領域 | 描画結果                                       |
| --------------------------------------------- | -------------- | ---------------------------------------------- |
| `videoUrl` 未設定                             | 非表示         | 従来通り（曲名・作曲家・カテゴリ・操作ボタン） |
| `videoUrl` が YouTube URL（`watch?v=`）       | 表示           | 左側にサムネイル＋従来要素                     |
| `videoUrl` が YouTube 短縮 URL（`youtu.be/`） | 表示           | 左側にサムネイル＋従来要素                     |
| `videoUrl` が YouTube 以外の URL              | 非表示         | 従来通り                                       |
| `videoUrl` は YouTube URL だが画像ロード失敗  | 表示後に非表示 | 読み込み失敗後は従来通り（要素ごと消える）     |
| スマホ表示（< 600px）                         | 上部に配置     | サムネイル → メイン情報 → 操作ボタン の順      |

---

## 6. テスト方針

### YouTubeThumbnail.test.ts

| describe   | it                                                          | 期待                                                                    |
| ---------- | ----------------------------------------------------------- | ----------------------------------------------------------------------- |
| 表示       | YouTube URL (`watch?v=`) の場合、`<img>` が描画される       | `img` が存在し、`src` が `img.youtube.com/vi/{id}/mqdefault.jpg` を含む |
| 表示       | YouTube 短縮 URL (`youtu.be/`) の場合、`<img>` が描画される | 同上                                                                    |
| 表示       | `videoUrl` が undefined の場合、要素が描画されない          | `img` が存在しない                                                      |
| 表示       | `videoUrl` が YouTube 以外の URL の場合、要素が描画されない | `img` が存在しない                                                      |
| 表示       | `alt` prop が `<img>` の alt 属性に反映される               | alt が期待値と一致                                                      |
| エラー処理 | 画像ロードエラー時に要素が非表示になる                      | `@error` 発火後 `img` が存在しない                                      |

### PieceItem.test.ts（追加分）

| describe   | it                                                                 | 期待                              |
| ---------- | ------------------------------------------------------------------ | --------------------------------- |
| サムネイル | `videoUrl` が YouTube URL の楽曲で `YouTubeThumbnail` が表示される | 対象要素が存在                    |
| サムネイル | `videoUrl` が未設定の楽曲でサムネイル領域が表示されない            | 対象要素が存在しない              |
| イベント   | サムネイル領域クリックで `detail` イベントが emit される           | `emitted('detail')` が1回呼ばれる |
| イベント   | 既存の「詳細」ボタンクリック時の `detail` emit が引き続き動作する  | リグレッション確認                |

### Storybook

- `YouTubeThumbnail.stories.ts`: YouTube URL あり / 短縮 URL / 非 YouTube URL / 未設定 の4バリエーション
- `PieceItem.stories.ts`: `WithYouTubeThumbnail` ストーリーを追加

---

## 7. アクセシビリティ・UX 考慮

- **alt 属性**: PieceItem 側で `${piece.title} の動画サムネイル` のような文字列を生成して渡す
- **クリック可能領域**: サムネイル領域を `<button>` でラップすることで、キーボード操作（Tab / Enter）が有効になる
- **`aria-label`**: button に「{曲名} の詳細を開く」を設定することで、画像のみだと伝わらないクリック先情報をスクリーンリーダーで補完
- **フォーカスリング**: 既存の `.btn-detail` 等と揃えたフォーカススタイルを適用
- **レイアウトシフト防止**: `<img>` に `width` / `height` 属性を指定し、画像読込前からアスペクト比を確保

---

## 8. やらないこと

- YouTube 以外の動画サービス（Vimeo / ニコニコ動画等）のサムネイル表示
- サムネイルクリック以外の middle-click・右クリックメニューから新規タブで開く対応（現状の emit ベースでは不可）
- ホバー時の動画プレビュー再生
- 楽曲詳細ページ以外（例: コンサート記録のプログラム欄）でのサムネイル表示 — Atom 化しているため将来必要になった時点で横展開可能

---

## 9. 実装順序

1. `YouTubeThumbnail.vue` / `.test.ts` / `.stories.ts` を新規作成しテストを通す
2. `PieceItem.vue` にサムネイル領域を追加、`PieceItem.test.ts` のテストを追加・更新
3. `PieceItem.stories.ts` にサムネイルありのストーリーを追加
4. `/pieces` ページで PC・スマホそれぞれ目視確認（AC-1〜AC-8 を満たすことを手動検証）
5. `docs/SPEC.md` / `docs/ARCHITECTURE.md` の該当セクションに新規 Atom を追記

---

## 10. レビュー結果

<!--
レビューアはこのセクションに指摘事項を記載してください。
- 解決済みは ✅、議論中は 💬、要修正は ❗ を付けること
- 指摘に対応した場合、対応内容を追記すること
-->

### 指摘事項

（レビュー待ち）

### 対応履歴

（レビュー後に記載）
