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

    <ErrorMessage v-if="fetchError" message="楽曲の取得に失敗しました。" variant="block" />

    <template v-else>
      <ErrorMessage v-if="errorMessage" :message="errorMessage" variant="block" />
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
</style>
