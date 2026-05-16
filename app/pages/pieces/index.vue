<script setup lang="ts">
import type { PieceWork } from "@/types";

const apiBase = useApiBase();
const { items, pending, error, hasMore, loadMore, reset, retry } = usePiecesPaginated();
const { data: composers, refresh: refreshComposers } = useComposersAll();
const { isAdmin } = useAuth();
const isAdminUser = isAdmin();

// 初回ロード
void loadMore();
void refreshComposers();

const composerNameById = computed<Record<string, string>>(() => {
  const map: Record<string, string> = {};
  for (const c of composers.value ?? []) {
    map[c.id] = c.name;
  }
  return map;
});

async function handleDelete(piece: PieceWork) {
  if (!confirm(`「${piece.title}」を削除しますか？`)) {
    return;
  }
  try {
    await $fetch(`${apiBase}/pieces/${piece.id}`, { method: "DELETE" });
    reset();
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
    :composer-name-by-id="composerNameById"
    @delete="handleDelete"
    @load-more="loadMore"
    @retry="retry"
  />
</template>
