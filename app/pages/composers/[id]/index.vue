<script setup lang="ts">
import type { Composer } from "~/types";

const route = useRoute();
const composerId = computed(() => route.params.id as string);
const { data: composer, error } = await useComposer(() => composerId.value);
const { deleteComposer } = useComposersPaginated();
const { isAdmin } = useAuth();
const isAdminUser = isAdmin();

const {
  data: pieces,
  pending: piecesPending,
  error: piecesError,
  refresh: refreshPieces,
} = usePiecesAll();
void refreshPieces();

const composerPieces = computed(() =>
  (pieces.value ?? []).filter((piece) => piece.composerId === composerId.value),
);

async function handleDelete(target: Composer) {
  if (!confirm(`「${target.name}」を削除しますか？`)) {
    return;
  }
  try {
    await deleteComposer(target.id);
    await navigateTo("/composers");
  } catch {
    alert("削除に失敗しました。もう一度お試しください。");
  }
}
</script>

<template>
  <ComposerDetailTemplate
    :composer="composer ?? null"
    :error="error"
    :is-admin="isAdminUser"
    :pieces="composerPieces"
    :pieces-pending="piecesPending"
    :pieces-error="piecesError"
    @delete="handleDelete"
  />
</template>
