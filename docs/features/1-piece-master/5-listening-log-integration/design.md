# 設計: ワーク5 鑑賞ログ連携

## フロントエンド

### Composable: `composables/usePieces.ts`

```typescript
export const usePieces = () => {
  const apiBase = useApiBase();
  return useFetch<Piece[]>(`${apiBase}/pieces`);
};
```

### `components/ListeningLogForm.vue` 更新

- `usePieces()` で楽曲一覧を取得
- フォーム上部に楽曲選択セレクトボックスを追加
  - 選択肢: 「選択しない」＋登録済み楽曲（`{title} / {composer}` 形式）
  - 楽曲を選択すると `form.piece`（曲名）・`form.composer` に自動入力
  - 「選択しない」を選ぶと自動入力をクリアし、手動入力に戻る
- 楽曲を選択していない場合は曲名・作曲家を手動入力できる（既存の動作を維持）

### 状態管理

- 選択中の楽曲 ID を `selectedPieceId` として `ref` で管理
- `watch(selectedPieceId, ...)` で `form.piece` / `form.composer` を更新

---

## レビュー結果

<!-- レビュー後にここに記載 -->
