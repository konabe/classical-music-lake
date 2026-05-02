<script setup lang="ts">
import type { CreateConcertLogInput } from "~/types";

defineProps<{
  error: string | null;
}>();

const emit = defineEmits<{
  submit: [values: CreateConcertLogInput];
}>();
</script>

<template>
  <div class="form-page">
    <NuxtLink to="/concert-logs" class="back-link">
      <span aria-hidden="true">&larr;</span>
      <span class="smallcaps">Back to concerts</span>
    </NuxtLink>

    <PageTitle eyebrow="IV / Halls" meta="New entry">コンサート記録を追加</PageTitle>

    <ErrorMessage v-if="error" :message="error" variant="block" />
    <ConcertLogForm submit-label="記録する" @submit="emit('submit', $event)" />
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
