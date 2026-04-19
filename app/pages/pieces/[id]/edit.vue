<script setup lang="ts">
import type { UpdatePieceInput } from "~/types";

definePageMeta({ middleware: ["admin"] });

const route = useRoute();
const id = computed(() => route.params.id as string);

const { data: piece, error } = await usePiece(() => id.value);
const { updatePiece } = usePiecesPaginated();
const { data: composers, pending: composersPending, refresh: refreshComposers } = useComposersAll();
await refreshComposers();
const errorMessage = ref("");

async function handleSubmit(values: UpdatePieceInput) {
  errorMessage.value = "";
  try {
    await updatePiece(id.value, values);
    await navigateTo("/pieces");
  } catch {
    errorMessage.value = "更新に失敗しました。入力内容を確認してください。";
  }
}
</script>

<template>
  <PieceEditTemplate
    :piece="piece ?? null"
    :fetch-error="error"
    :error-message="errorMessage"
    :composers="composers ?? []"
    :composers-pending="composersPending"
    @submit="handleSubmit"
  />
</template>
