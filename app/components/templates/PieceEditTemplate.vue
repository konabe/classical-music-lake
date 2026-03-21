<script setup lang="ts">
import type { Piece, UpdatePieceInput } from "~/types";

defineProps<{
  piece: Piece | null;
  fetchError: Error | null;
  errorMessage: string;
}>();

const emit = defineEmits<{
  submit: [values: UpdatePieceInput];
}>();
</script>

<template>
  <div>
    <h1 class="page-title">楽曲を編集</h1>

    <div v-if="fetchError" class="error-message">楽曲の取得に失敗しました。</div>

    <template v-else>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      <PieceForm
        :initial-values="{ title: piece?.title, composer: piece?.composer }"
        submit-label="更新する"
        @submit="emit('submit', $event)"
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
