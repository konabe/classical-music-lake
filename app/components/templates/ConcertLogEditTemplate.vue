<script setup lang="ts">
import type { ConcertLog, UpdateConcertLogInput } from "@/types";

defineProps<{
  log: ConcertLog;
  error: string | null;
}>();

const emit = defineEmits<{
  submit: [values: UpdateConcertLogInput];
}>();
</script>

<template>
  <div class="form-page">
    <NuxtLink to="/concert-logs" class="back-link">
      <span aria-hidden="true">&larr;</span>
      <span class="smallcaps">Back to concerts</span>
    </NuxtLink>

    <PageTitle eyebrow="IV / Halls" meta="Edit">コンサート記録を編集</PageTitle>

    <ErrorMessage v-if="error" :message="error" variant="block" />
    <ConcertLogForm
      :initial-values="log"
      submit-label="更新する"
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
