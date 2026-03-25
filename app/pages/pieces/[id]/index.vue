<script setup lang="ts">
import type { Rating } from "~/types";

const route = useRoute();
const { data: piece, error } = await usePiece(() => route.params.id as string);
const { create } = useListeningLogs();

async function handleSave(values: { rating: Rating; isFavorite: boolean; memo: string }) {
  if (!piece.value) return;
  await create({
    listenedAt: new Date().toISOString(),
    composer: piece.value.composer,
    piece: piece.value.title,
    userId: null,
    ...values,
  });
}
</script>

<template>
  <PieceDetailTemplate :piece="piece ?? null" :error="error" @save="handleSave" />
</template>
