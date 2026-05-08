<script setup lang="ts">
import type { Piece, Rating } from "~/types";

const route = useRoute();
const apiBase = useApiBase();
const { data: piece, error } = await usePiece(() => route.params.id as string);
const { data: composers, refresh: refreshComposers } = useComposersAll();
await refreshComposers();
const { create } = useListeningLogCreate();
const { isAdmin } = useAuth();
const isAdminUser = isAdmin();

const composerName = computed(() => {
  const id = piece.value?.composerId;
  if (id === undefined) {
    return "";
  }
  const found = (composers.value ?? []).find((c) => c.id === id);
  return found?.name ?? "(不明な作曲家)";
});

async function handleSave(values: { rating: Rating; isFavorite: boolean; memo: string }) {
  if (piece.value === null) {
    return;
  }
  await create({
    listenedAt: new Date().toISOString(),
    composer: composerName.value,
    piece: piece.value.title,
    pieceId: piece.value.id,
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
    :is-admin="isAdminUser"
    :composer-name="composerName"
    @save="handleSave"
    @delete="handleDelete"
  />
</template>
