<script setup lang="ts">
import type { Piece } from "~/types";

const { items, pending, error, hasMore, loadMore, retry, deletePiece } = usePiecesPaginated();
const { isAdmin } = useAuth();
const isAdminUser = isAdmin();

// 初回ロード
void loadMore();

async function handleDelete(piece: Piece) {
  if (!confirm(`「${piece.title}」を削除しますか？`)) {
    return;
  }
  try {
    await deletePiece(piece.id);
    await loadMore();
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "削除に失敗しました。もう一度お試しください。";
    alert(message);
  }
}
</script>

<template>
  <PiecesTemplate
    :pieces="items"
    :error="error"
    :pending="pending"
    :has-more="hasMore"
    :is-admin="isAdminUser"
    @delete="handleDelete"
    @load-more="loadMore"
    @retry="retry"
  />
</template>
