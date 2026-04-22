<script setup lang="ts">
import type { Composer, Piece, UpdatePieceInput } from "~/types";

defineProps<{
  piece: Piece | null;
  fetchError: Error | null;
  error: string | null;
  composers: Composer[];
  composersPending?: boolean;
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
      <ErrorMessage v-if="error" :message="error" variant="block" />
      <PieceForm
        :initial-values="{
          title: piece?.title,
          composerId: piece?.composerId,
          videoUrl: piece?.videoUrl,
        }"
        :composers="composers"
        :composers-pending="composersPending"
        submit-label="更新する"
        @submit="emit('submit', $event)"
      />
    </template>
  </div>
</template>

<style scoped>
.page-title {
  font-size: 1.6rem;
  color: var(--color-text);
  margin-bottom: 1.5rem;
}
</style>
