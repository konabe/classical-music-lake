<script setup lang="ts">
import type { ListeningLog, Piece, Rating } from "~/types";

const route = useRoute();
const apiBase = useApiBase();
const { data: piece, error } = await usePiece(() => route.params.id as string);
const { data: composers, refresh: refreshComposers } = useComposersAll();
await refreshComposers();
const { create } = useListeningLogCreate();
const { isAdmin, isAuthenticated } = useAuth();
const isAdminUser = isAdmin();

const composerName = computed(() => {
  const id = piece.value?.composerId;
  if (id === undefined) {
    return "";
  }
  const found = (composers.value ?? []).find((c) => c.id === id);
  return found?.name ?? "(不明な作曲家)";
});

const authenticated: boolean = isAuthenticated();
const listeningLogsResource = authenticated ? useListeningLogs() : null;
if (listeningLogsResource !== null) {
  await listeningLogsResource.execute();
}

const listeningLogs = computed<ListeningLog[]>(() => {
  if (listeningLogsResource === null || piece.value === null) {
    return [];
  }
  const all = listeningLogsResource.data.value ?? [];
  const pieceId = piece.value.id;
  const title = piece.value.title;
  const composer = composerName.value;
  return all
    .filter((log) => {
      if (log.pieceId !== undefined) {
        return log.pieceId === pieceId;
      }
      return log.piece === title && log.composer === composer;
    })
    .slice()
    .sort((a, b) => b.listenedAt.localeCompare(a.listenedAt));
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
  if (listeningLogsResource !== null) {
    await listeningLogsResource.refresh();
  }
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
    :listening-logs="listeningLogs"
    @save="handleSave"
    @delete="handleDelete"
  />
</template>
