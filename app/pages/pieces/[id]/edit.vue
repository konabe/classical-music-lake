<script setup lang="ts">
import type { UpdatePieceInput } from "~/types";

const route = useRoute();
const id = computed(() => route.params.id as string);

const { data: piece, error } = await usePiece(() => id.value);
const { updatePiece } = usePieces();

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
  <div>
    <h1 class="page-title">楽曲を編集</h1>

    <div v-if="error" class="error-message">楽曲の取得に失敗しました。</div>

    <template v-else>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      <PieceForm
        :initial-values="{ title: piece?.title, composer: piece?.composer }"
        submit-label="更新する"
        @submit="handleSubmit"
      />
    </template>
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
