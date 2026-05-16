<script setup lang="ts">
import type { Composer, CreatePieceInput } from "@/types";

defineProps<{
  error: string | null;
  composers: Composer[];
  composersPending?: boolean;
}>();

const emit = defineEmits<{
  submit: [values: CreatePieceInput];
}>();
</script>

<template>
  <div class="form-page">
    <NuxtLink to="/pieces" class="back-link">
      <span aria-hidden="true">&larr;</span>
      <span class="smallcaps">Back to repertoire</span>
    </NuxtLink>

    <PageTitle eyebrow="II / Repertoire" meta="New entry">楽曲を追加</PageTitle>

    <ErrorMessage v-if="error" :message="error" variant="block" />

    <PieceForm
      :composers="composers"
      :composers-pending="composersPending"
      submit-label="登録する"
      @submit="emit('submit', $event)"
    />
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
