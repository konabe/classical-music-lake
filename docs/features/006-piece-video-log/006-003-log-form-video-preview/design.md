# 006-003 視聴ログ作成フォームで楽曲の動画を確認できる - 設計書

## 概要

視聴ログの新規作成・編集フォームで、楽曲マスタから曲を選択した際に
`videoUrl` が設定されていれば動画プレイヤーをインライン表示する。

---

## 影響範囲

### 変更対象

| ファイル                                            | 変更内容                                                        |
| --------------------------------------------------- | --------------------------------------------------------------- |
| `app/components/organisms/ListeningLogForm.vue`     | 選択中の Piece の `videoUrl` を追跡し、`VideoPlayer` を条件表示 |
| `app/components/organisms/ListeningLogForm.test.ts` | 動画プレイヤーの表示・非表示・切替のテストを追加                |

### 新規作成なし

`VideoPlayer` コンポーネントは 006-001 で既に実装済みのため、新規コンポーネントは不要。

---

## 設計詳細

### 状態管理

`ListeningLogForm` に以下のリアクティブ変数を追加する。

| 変数               | 型                    | 説明                                                                   |
| ------------------ | --------------------- | ---------------------------------------------------------------------- |
| `selectedVideoUrl` | `string \| undefined` | 選択中の Piece の `videoUrl`。未設定または選択なしの場合は `undefined` |

### `handlePieceSelect` の変更

現在は選択された Piece から `title` と `composer` だけを取り出しているが、
`videoUrl` も合わせて `selectedVideoUrl` にセットするよう拡張する。
「選択しない」（空値）が選ばれた場合は `selectedVideoUrl` を `undefined` にリセットする。

### テンプレートの変更

楽曲マスタ選択セレクトの直下に `VideoPlayer` を追加する。
`selectedVideoUrl` が truthy な場合のみ `v-if` で表示する。

```
[ 楽曲マスタから選択 (select) ]
[ VideoPlayer ] ← selectedVideoUrl が truthy なときのみ表示
[ 作曲家 / 曲名 ]
...
```

`VideoPlayer` への `videoUrl` prop には `selectedVideoUrl` を渡す。
`play` イベントは本ワークでは使用しない（ハンドラ不要）。

---

## 受入テストケースとの対応

| テストケース                                              | 実現方法                                                                     |
| --------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `videoUrl` ありの曲を選択すると動画プレイヤーが表示される | `selectedVideoUrl` に値がセットされ `v-if` が true になる                    |
| 表示された動画は選択した曲のものである                    | `VideoPlayer` の `videoUrl` prop に `selectedVideoUrl` を渡すため一致する    |
| 動画を見ながら他の項目を入力できる                        | プレイヤーはフォームの途中に配置されるため他フィールドはそのまま操作可能     |
| `videoUrl` なしの曲を選択しても表示されない               | `selectedVideoUrl` が `undefined` のまま `v-if` が false になる              |
| 別の曲に変えると動画が切り替わる                          | `handlePieceSelect` で `selectedVideoUrl` を新しい値で上書きするため自動切替 |
| 「選択しない」にすると動画が非表示になる                  | `selectedVideoUrl` を `undefined` にリセットするため `v-if` が false になる  |

---

## レビュー結果

OK
