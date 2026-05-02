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
  <div class="form-page">
    <NuxtLink to="/pieces" class="back-link">
      <span aria-hidden="true">&larr;</span>
      <span class="smallcaps">Back to repertoire</span>
    </NuxtLink>

    <PageTitle eyebrow="II / Repertoire" meta="Edit">楽曲を編集</PageTitle>

    <ErrorMessage v-if="fetchError" message="楽曲の取得に失敗しました。" variant="block" />

    <template v-else>
      <ErrorMessage v-if="error" :message="error" variant="block" />
      <PieceForm
        :initial-values="{
          title: piece?.title,
          composerId: piece?.composerId,
          videoUrls: piece?.videoUrls,
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
.form-page {
  margin-bottom: 4rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--color-text-muted);
  text-decoration: none;
  margin-bottom: 1.5rem;
  transition:
    color 0.25s ease,
    gap 0.25s ease;
}

.back-link:hover {
  color: var(--color-accent);
  gap: 0.65rem;
}
</style>
