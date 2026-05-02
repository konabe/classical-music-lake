<script setup lang="ts">
import type { Composer, UpdateComposerInput } from "~/types";

defineProps<{
  composer: Composer | null;
  fetchError: Error | null;
  error: string | null;
}>();

const emit = defineEmits<{
  submit: [values: UpdateComposerInput];
}>();
</script>

<template>
  <div class="form-page">
    <NuxtLink to="/composers" class="back-link">
      <span aria-hidden="true">&larr;</span>
      <span class="smallcaps">Back to composers</span>
    </NuxtLink>

    <PageTitle eyebrow="III / Composers" meta="Edit">作曲家を編集</PageTitle>

    <ErrorMessage v-if="fetchError" message="作曲家の取得に失敗しました。" variant="block" />

    <template v-else>
      <ErrorMessage v-if="error" :message="error" variant="block" />
      <ComposerForm
        :initial-values="{
          name: composer?.name,
          era: composer?.era,
          region: composer?.region,
          imageUrl: composer?.imageUrl,
          birthYear: composer?.birthYear,
          deathYear: composer?.deathYear,
        }"
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
