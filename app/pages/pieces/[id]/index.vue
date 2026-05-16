<script setup lang="ts">
import type { ListeningLog, Piece, PieceMovement, PieceWork, Rating } from "@/types";

const route = useRoute();
const apiBase = useApiBase();
const { data: piece, error } = await usePiece(() => route.params.id as string);
const { data: composers, refresh: refreshComposers } = useComposersAll();
await refreshComposers();
const { create } = useListeningLogCreate();
const { isAdmin, isAuthenticated } = useAuth();
const isAdminUser = isAdmin();

// Movement を直接開いた場合、親 Work を取得して composerId・タイトルを継承解決する。
const parentWorkId = computed<string | null>(() => {
  if (piece.value === null || piece.value === undefined) return null;
  return piece.value.kind === "movement" ? piece.value.parentId : null;
});

const parentWork = ref<PieceWork | null>(null);
watch(
  parentWorkId,
  async (id) => {
    if (id === null) {
      parentWork.value = null;
      return;
    }
    try {
      const fetched = await $fetch<Piece>(`${apiBase}/pieces/${id}`);
      parentWork.value = fetched.kind === "work" ? fetched : null;
    } catch {
      parentWork.value = null;
    }
  },
  { immediate: true },
);

// Work の場合のみ楽章一覧を取得する。Movement の場合は不要（描画されない）。
const movementsWorkId = computed(() => (piece.value?.kind === "work" ? piece.value.id : null));
const movements = ref<PieceMovement[]>([]);
watch(
  movementsWorkId,
  async (id) => {
    if (id === null) {
      movements.value = [];
      return;
    }
    try {
      const fetched = await $fetch<PieceMovement[]>(`${apiBase}/pieces/${id}/children`);
      movements.value = fetched;
    } catch {
      movements.value = [];
    }
  },
  { immediate: true },
);

const composerName = computed(() => {
  let id: string | undefined;
  if (piece.value?.kind === "work") {
    id = piece.value.composerId;
  } else if (piece.value?.kind === "movement") {
    id = parentWork.value?.composerId;
  }
  if (id === undefined) {
    return "";
  }
  const found = (composers.value ?? []).find((c) => c.id === id);
  return found?.name ?? "(不明な作曲家)";
});

const quickLogPieceLabel = computed(() => {
  if (piece.value === null || piece.value === undefined) return "";
  if (piece.value.kind === "movement") {
    const parentTitle = parentWork.value?.title ?? "";
    return parentTitle === "" ? piece.value.title : `${parentTitle} - ${piece.value.title}`;
  }
  return piece.value.title;
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
  return all
    .filter((log) => log.pieceId === pieceId)
    .slice()
    .sort((a, b) => b.listenedAt.localeCompare(a.listenedAt));
});

async function handleSave(values: { rating: Rating; isFavorite: boolean; memo: string }) {
  if (piece.value === null) {
    return;
  }
  await create({
    listenedAt: new Date().toISOString(),
    pieceId: piece.value.id,
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
    :movements="movements"
    :parent-work="parentWork"
    :quick-log-piece-label="quickLogPieceLabel"
    @save="handleSave"
    @delete="handleDelete"
  />
</template>
