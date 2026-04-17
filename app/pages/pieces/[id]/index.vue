<script setup lang="ts">
import type { Piece, Rating } from "~/types";

const route = useRoute();
const apiBase = useApiBase();
const { data: piece, error } = await usePiece(() => route.params.id as string);
const { create } = useListeningLogs();
const { isAdmin } = useAuth();
const isAdminUser = isAdmin();

const autoplay = computed(() => route.query.autoplay === "1");

async function handleSave(values: { rating: Rating; isFavorite: boolean; memo: string }) {
  if (piece.value === null) {
    return;
  }
  await create({
    listenedAt: new Date().toISOString(),
    composer: piece.value.composer,
    piece: piece.value.title,
    userId: null,
    ...values,
  });
}

async function handleDelete(target: Piece) {
  if (!confirm(`「${target.title}」を削除しますか？`)) {
    return;
  }
  try {
    await $fetch(`${apiBase}/pieces/${target.id}`, { method: "DELETE" });
    await navigateTo("/pieces");
  } catch {
    alert("削除に失敗しました。もう一度お試しください。");
  }
}
</script>

<template>
  <PieceDetailTemplate
    :piece="piece ?? null"
    :error="error"
    :autoplay="autoplay"
    :is-admin="isAdminUser"
    @save="handleSave"
    @delete="handleDelete"
  />
</template>
