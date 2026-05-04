<script setup lang="ts">
definePageMeta({ middleware: "auth" });

const route = useRoute();
const { data: log } = await useListeningLog(() => route.params.id as string);
const { data: pieces, refresh: refreshPieces } = usePiecesAll();
const { data: composers, refresh: refreshComposers } = useComposersAll();
await Promise.all([refreshPieces(), refreshComposers()]);

const pieceId = computed<string | undefined>(() => {
  // 1. ログに pieceId が保存されていればそれを優先
  if (log.value?.pieceId !== undefined && log.value.pieceId !== "") {
    return log.value.pieceId;
  }
  // 2. 旧データ互換: 曲名 + 作曲家名の完全一致でフォールバック解決
  const composerName = log.value?.composer;
  const pieceTitle = log.value?.piece;
  if (
    composerName === undefined ||
    composerName === "" ||
    pieceTitle === undefined ||
    pieceTitle === ""
  ) {
    return undefined;
  }
  return pieces.value?.find((p) => {
    if (p.title !== pieceTitle) return false;
    const composer = composers.value?.find((c) => c.id === p.composerId);
    return composer?.name === composerName;
  })?.id;
});
</script>

<template>
  <ListeningLogDetailTemplate v-if="log" :log="log" :piece-id="pieceId" />
</template>
