<script setup lang="ts">
import type { CreatePieceInput } from "~/types";

const { createPiece } = usePiecesPaginated();
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
  <PieceNewTemplate :error-message="errorMessage" @submit="handleSubmit" />
</template>
