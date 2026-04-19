<script setup lang="ts">
import type { CreatePieceInput } from "~/types";

definePageMeta({ middleware: ["admin"] });

const { createPiece } = usePiecesPaginated();
const { data: composers, pending: composersPending, refresh: refreshComposers } = useComposersAll();
await refreshComposers();

const errorMessage = ref("");

async function handleSubmit(values: CreatePieceInput) {
  errorMessage.value = "";
  try {
    await createPiece(values);
    await navigateTo("/pieces");
  } catch {
    errorMessage.value = "登録に失敗しました。入力内容を確認してください。";
  }
}
</script>

<template>
  <PieceNewTemplate
    :error-message="errorMessage"
    :composers="composers ?? []"
    :composers-pending="composersPending"
    @submit="handleSubmit"
  />
</template>
