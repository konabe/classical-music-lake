<script setup lang="ts">
import type { CreatePieceInput } from "~/types";

const { createPiece } = usePieces();

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
  <div>
    <h1 class="page-title">楽曲を追加</h1>

    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

    <PieceForm submit-label="登録する" @submit="handleSubmit" />
  </div>
</template>

<style scoped>
.page-title {
  font-size: 1.6rem;
  color: #1a1a2e;
  margin-bottom: 1.5rem;
}

.error-message {
  background: #fff0f0;
  border: 1px solid #f5c6c6;
  color: #c0392b;
  padding: 0.8rem 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}
</style>
