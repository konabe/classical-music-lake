<script setup lang="ts">
import type { Piece } from "~/types";

const apiBase = useApiBase();
const { data: pieces, error, refresh } = await useFetch<Piece[]>(`${apiBase}/pieces`);

async function handleDelete(piece: Piece) {
  if (!confirm(`「${piece.title}」を削除しますか？`)) return;
  try {
    await $fetch(`${apiBase}/pieces/${piece.id}`, { method: "DELETE" });
    await refresh();
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "削除に失敗しました。もう一度お試しください。";
    alert(message);
  }
}
</script>

<template>
  <PiecesTemplate :pieces="pieces ?? []" :error="error" @delete="handleDelete" />
</template>
